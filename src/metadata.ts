import { FieldDescriptor, GlobalDescriptor, Maybe, TableDescriptor, FieldType } from "./type";
import { fetchFromChunkOrValue } from "./utils";

class Metadata {
    private global: GlobalDescriptor = {};

    // Examine for conflicting fields.
    // This is the case when the type overlaps, or the name overlaps.
    //
    private checkConflict<TObject>(fieldDescriptor: FieldDescriptor<TObject>) {
        // Validation check.
        // Is it registered in the metadata?
        const classKey: string = fieldDescriptor.class.constructor.toString();
        const table: Maybe<TableDescriptor<any>> = this.global[classKey];
        if (table == undefined) throw new Error(`Unregistered entity [${fieldDescriptor.class.constructor.name}]`);

        //  Examine if:
        //      1. Duplicate name of field.
        //      2. Duplicate type of field
        const thisFieldName: string = fetchFromChunkOrValue<string>(fieldDescriptor.dynamoPropertyName, null);
        const thisFieldTypeName: FieldType = fetchFromChunkOrValue<FieldType>(fieldDescriptor.dynamoFieldtype, null);
        const attrs = table.attrs;

        if (table.hash?.dynamoPropertyName) {
            const hashFieldName: string = fetchFromChunkOrValue<string>(table?.hash?.dynamoPropertyName!!, null);
            if (thisFieldTypeName == "Hash" && hashFieldName) {
                throw new Error(`Duplicate hashKey, [${hashFieldName}] and [${thisFieldName}]`);
            }
            if (hashFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }

        if (table.range?.dynamoPropertyName) {
            const rangeFieldName: string = fetchFromChunkOrValue<string>(table?.range?.dynamoPropertyName!!, null);
            if (thisFieldTypeName == "Range" && rangeFieldName) {
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
    public add<TObject>(fieldDescriptor: FieldDescriptor<TObject>) {
        // If there is no table, create one.
        const classKey = fieldDescriptor.class.constructor.toString();
        let table: Maybe<TableDescriptor<any>> = this.global[classKey];
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
        let thisFieldType: string = fetchFromChunkOrValue<string>(fieldDescriptor.dynamoFieldtype, undefined);
        if (thisFieldType == "Hash") table.hash = fieldDescriptor;
        if (thisFieldType == "Range") table.range = fieldDescriptor;
        if (thisFieldType == "Attr") {
            table.attrs!!.set(
                fetchFromChunkOrValue<string>(fieldDescriptor.dynamoPropertyName, undefined),
                fieldDescriptor
            );
        }
    }

    // Gets the TableDescriptor associated with a given data object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    public getOf(object: Object) {
        return this.global[object.constructor.toString()];
    }
}

const metadata = new Metadata();
export default metadata;
