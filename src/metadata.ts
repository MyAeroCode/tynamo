import { FieldDescriptor, GlobalDescriptor, TableDescriptor, Fieldtype, Item } from "./type";
import { fetchFromChunkOrValue } from "./utils";

class Metadata {
    private global: GlobalDescriptor = {};
    private classObjectCache = new Map<string, any>();

    // Examine for conflicting fields.
    // This is the case when the type overlaps, or the name overlaps.
    //
    private checkConflict<TObject>(fieldDescriptor: FieldDescriptor<TObject>) {
        // Validation check.
        // Is it registered in the metadata?
        const classKey: string = fieldDescriptor.class.constructor.toString();
        const table: TableDescriptor<any> | undefined = this.global[classKey];
        if (table == undefined) throw new Error(`Unregistered entity [${fieldDescriptor.class.constructor.name}]`);

        //  Examine if:
        //      1. Duplicate name of field.
        //      2. Duplicate type of field
        const thisFieldName: string = fetchFromChunkOrValue<string>(fieldDescriptor.dynamoPropertyName, null);
        const thisFieldtype: Fieldtype = fetchFromChunkOrValue<Fieldtype>(fieldDescriptor.fieldtype, null);
        const attrs = table.attrs;

        if (table.hash?.dynamoPropertyName) {
            const hashFieldName: string = fetchFromChunkOrValue<string>(table?.hash?.dynamoPropertyName!!, null);
            if (thisFieldtype == Fieldtype.hash && hashFieldName) {
                throw new Error(`Duplicate hashKey, [${hashFieldName}] and [${thisFieldName}]`);
            }
            if (hashFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }

        if (table.range?.dynamoPropertyName) {
            const rangeFieldName: string = fetchFromChunkOrValue<string>(table?.range?.dynamoPropertyName!!, null);
            if (thisFieldtype == Fieldtype.range && rangeFieldName) {
                throw new Error(`Duplicate rangeKey, [${rangeFieldName}] and [${thisFieldName}]`);
            }
            if (rangeFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }

        if (attrs?.has(thisFieldName)) {
            throw new Error(`Duplicate attrName, [${thisFieldName}]`);
        }
    }

    // Insert one FieldDescriptor.
    // It can be merged if it does not conflict.
    //
    public add<TObject>(fieldDescriptor: FieldDescriptor<TObject>) {
        // If there is no table, create one.
        const classKey = fieldDescriptor.class.constructor.toString();
        let table: TableDescriptor<any> | undefined = this.global[classKey];
        if (table == undefined) {
            table = this.global[classKey] = {
                attrs: new Map<string, FieldDescriptor<TObject>>(),
                hash: undefined,
                range: undefined
            };
        }

        // Examine validity and conflict.
        // then insert them in the correct place.
        this.checkConflict(fieldDescriptor);
        let thisFieldType: Fieldtype = fetchFromChunkOrValue<Fieldtype>(fieldDescriptor.fieldtype, undefined);
        if (thisFieldType == Fieldtype.hash) table.hash = fieldDescriptor;
        if (thisFieldType == Fieldtype.range) table.range = fieldDescriptor;
        if (thisFieldType == Fieldtype.attr) {
            table.attrs!!.set(
                fetchFromChunkOrValue<string>(fieldDescriptor.dynamoPropertyName, undefined),
                fieldDescriptor
            );
        }

        // Convert constructor to constructable object.
        // Then caching it.
        if (!this.classObjectCache.has(classKey)) {
            const classObject = eval(`${classKey}; ${fieldDescriptor.class.constructor.name}`);
            this.classObjectCache.set(classKey, classObject);
        }
    }

    // Gets the TableDescriptor associated with a given data object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    public getOf<TObject>(object: Object): TableDescriptor<TObject> {
        const classKey: string = object.constructor.toString();
        const table = this.global[classKey];
        if (!table) {
            throw new Error(`Unregistered entity [${object.constructor.name}]`);
        }
        if (!table.hash) {
            throw new Error(`No hashKey in [${object.constructor.name}]`);
        }
        return table;
    }

    // Returns a descriptor with the same structure.
    // If there are many such descriptors, an error.
    // For the primitive, return undefined.
    //
    public searchClassObjectLike(item: Item): any {
        // Primitive check.
        if (item.N) return undefined;
        if (item.S) return undefined;
        if (item.BOOL) return undefined;

        // Find such descriptors.
        let found: any[] = [];
        for (let classKey in this.global) {
            let classObject: any = undefined;
            const tableFieldNames: string[] = this.getAllFieldsOf(classKey).map((fieldDescriptor) => {
                if (!classObject) classObject = fieldDescriptor.class;
                return fetchFromChunkOrValue<string>(fieldDescriptor.dynamoPropertyName, null);
            });
            const itemFieldNames: string[] = [];
            for (let name in item) {
                itemFieldNames.push(name);
            }

            if (tableFieldNames.length !== itemFieldNames.length) continue;
            tableFieldNames.sort();
            itemFieldNames.sort();
            let isMatch: boolean = true;
            for (let i = 0; i < tableFieldNames.length; i++) {
                if (tableFieldNames[i] !== itemFieldNames[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                found.push(classObject);
            }
        }

        // Check validation.
        if (found.length == 0) {
            throw new Error(`No such table.`);
        } else if (found.length >= 2) {
            throw new Error(`Table Structure Conflict. [${found.map((f) => f.constructor.name)}]`);
        }
        console.log("find!", found[0].constructor.name);

        // Return constructable object.
        // It it new-keyword-usable object.
        const classObject = this.classObjectCache.get(found[0].constructor.toString());
        return classObject;
    }

    // Gets the list of all fields in a given table.
    //
    private getAllFieldsOf(classKey: string): FieldDescriptor<any>[] {
        const table: TableDescriptor<any> | undefined = this.global[classKey];
        if (table == undefined) throw new Error(`Unregistered entity. [${classKey}]`);

        const allFields: FieldDescriptor<any>[] = [];
        if (table.hash) allFields.push(table.hash);
        if (table.range) allFields.push(table.range);
        if (table.attrs) allFields.push(...table.attrs.values());

        return allFields;
    }
}

const metadata = new Metadata();
export default metadata;
