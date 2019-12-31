import { PropertyDescriptor, EntityDescriptor, PropertyType, Item } from "./type";
import { fetchFromChunkOrValue } from "./utils";
import { DataType } from ".";

class MetaData {
    private meta = new Map<string, EntityDescriptor<any>>();

    // Examine for conflicting property.
    // Test if the duplicate keyType or propertyName.
    //
    private propertyConflictTest<TSource>(propertyDescriptor: PropertyDescriptor<TSource>) {
        // Validation check.
        // Is it registered entity in the metadata?
        const entityDescriptor: EntityDescriptor<any> | undefined = this.meta.get(propertyDescriptor.TClassName);
        if (entityDescriptor == undefined) {
            throw new Error(`Unregistered class [${propertyDescriptor.TClassName}]`);
        }

        // Validation check.
        // KeyType is must non-nullable.
        if (
            (propertyDescriptor.dynamoPropertyType == PropertyType.hash ||
                propertyDescriptor.dynamoPropertyType == PropertyType.range) &&
            propertyDescriptor.nullable
        ) {
            throw new Error(
                `KeyType is must non-nullable. -> [${propertyDescriptor.TClassName}.${propertyDescriptor.sourcePropertyName}]`
            );
        }

        // Simplify variable name.
        const thisPropertyName: string = propertyDescriptor.dynamoPropertyName;
        const thisPropertyType: PropertyType = propertyDescriptor.dynamoPropertyType;
        const HASH: PropertyDescriptor<TSource> | undefined = entityDescriptor.hash;
        const RANGE: PropertyDescriptor<TSource> | undefined = entityDescriptor.range;
        const ATTRS: Map<string, PropertyDescriptor<TSource>> | undefined = entityDescriptor.attrs;

        // Test for KeyType.
        if ((thisPropertyType === PropertyType.hash && HASH) || (thisPropertyType === PropertyType.range && RANGE)) {
            throw new Error(`Duplicate ${thisPropertyType} Key of [${propertyDescriptor.TClassName}].`);
        }

        // Test for DynamoPropertyName.
        const dynamoPropertyNameSet: Set<string> = new Set<string>();
        if (HASH) dynamoPropertyNameSet.add(HASH.dynamoPropertyName);
        if (RANGE) dynamoPropertyNameSet.add(RANGE.dynamoPropertyName);
        ATTRS?.forEach((attr) => dynamoPropertyNameSet.add(attr.dynamoPropertyName));
        if (dynamoPropertyNameSet.has(thisPropertyName)) {
            throw new Error(`Duplicate DynamoPropertyName of ${thisPropertyType}. -> ${thisPropertyName}`);
        }
    }

    // Attch TClass(constructable) into EntityDescriptor.
    // It is for create a new object through TClass.
    //
    public registEntity(TClass: any) {
        let entityDescriptor: EntityDescriptor<any> | undefined = this.meta.get(TClass.name);
        if (entityDescriptor === undefined) {
            this.meta.set(TClass.name, {
                TClass: TClass,
                attrs: new Map<string, PropertyDescriptor<any>>()
            });
        } else {
            entityDescriptor.TClass = TClass;
        }
    }

    // Insert one Property Descriptor.
    // It can be merged if it does not conflict.
    //
    public registPropertyDescriptor<TSource>(propertyDescriptor: PropertyDescriptor<TSource>) {
        // Validation check.
        // Is it registered entity in the metadata?
        let entityDescriptor: EntityDescriptor<any> | undefined = this.meta.get(propertyDescriptor.TClassName);
        if (entityDescriptor == undefined) {
            entityDescriptor = {
                attrs: new Map<string, PropertyDescriptor<TSource>>()
            };
            this.meta.set(propertyDescriptor.TClassName, entityDescriptor);
        }

        // Examine validity and conflict.
        // then insert them in the correct place.
        this.propertyConflictTest(propertyDescriptor);

        let thisFieldType: PropertyType = propertyDescriptor.dynamoPropertyType;
        if (thisFieldType == PropertyType.hash) {
            entityDescriptor.hash = propertyDescriptor;
        } else if (thisFieldType == PropertyType.range) {
            entityDescriptor.range = propertyDescriptor;
        } else if (thisFieldType == PropertyType.attr) {
            entityDescriptor.attrs!!.set(propertyDescriptor.dynamoPropertyName, propertyDescriptor);
        }
    }

    // Gets the Entity Descriptor associated with a given object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    public getOf<TSource>(object: any): EntityDescriptor<TSource> {
        const entityDescriptor: EntityDescriptor<TSource> | undefined = this.meta.get(object.constructor.name);
        if (entityDescriptor === undefined) {
            throw new Error(`Unregistered class [${object.constructor.name}]`);
        }
        if (entityDescriptor.TClass === undefined) {
            throw new Error(`No metadata for ${object.constructor.name}. Make sure @DynamoEntity is append correclty.`);
        }
        if (!entityDescriptor.hash) {
            throw new Error(`No HashKey in [${object.constructor.name}]. HashKey is required.`);
        }
        return entityDescriptor;
    }

    // Returns a TClass with the same entry structure.
    // Occur error if there are many such TClass.
    //
    public getTClassOf(dynamo: Item): any {
        // Coolect all property name of dynamo.
        const propertyNames: string[] = [];
        for (const propertyName in dynamo) {
            propertyNames.push(propertyName);
        }
        propertyNames.sort();

        // Find same name-set.
        const foundTClass: any[] = [];
        for (const entityDescriptor of this.meta.values()) {
            let thisTClass: any = undefined;
            const entryPropertyNames: string[] = this.getAllPropertiesOf(entityDescriptor).map((fieldDescriptor) => {
                if (thisTClass === undefined) thisTClass = entityDescriptor.TClass;
                return fieldDescriptor.dynamoPropertyName;
            });

            if (entryPropertyNames.length !== propertyNames.length) continue;
            entryPropertyNames.sort();

            let isMatch: boolean = true;
            for (let i = 0; i < entryPropertyNames.length; i++) {
                if (entryPropertyNames[i] !== propertyNames[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                foundTClass.push(thisTClass);
            }
        }

        // Check validation.
        if (foundTClass.length == 0) {
            throw new Error(`No such table.`);
        } else if (foundTClass.length >= 2) {
            throw new Error(`Entity Structure Conflict. [${foundTClass.map((f) => f.constructor.name)}]`);
        }

        // Return constructable object.
        // It it new-keyword-usable object.
        return foundTClass[0];
    }

    // Gets the list of all fields in a given table.
    //
    private getAllPropertiesOf(entityDescriptor: EntityDescriptor<any>): PropertyDescriptor<any>[] {
        const allFields: PropertyDescriptor<any>[] = [];
        if (entityDescriptor.hash) allFields.push(entityDescriptor.hash);
        if (entityDescriptor.range) allFields.push(entityDescriptor.range);
        if (entityDescriptor.attrs) allFields.push(...entityDescriptor.attrs.values());

        return allFields;
    }
}

const metaData = new MetaData();
export default metaData;
