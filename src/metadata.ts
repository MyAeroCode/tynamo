import { PropertyDescriptor, EntityDescriptor, PropertyType, Item, DataType } from "./type";

class MetaData {
    private meta = new Map<string, EntityDescriptor<any>>();
    private getTClassByDynamoCache = new Map<string, any>();

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
    public getEntityDescriptorByHolder<TSource>(object: any): EntityDescriptor<TSource> {
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
    // @TODO    Currently, there is only PropertyName in the signature.
    //          Put PropertyDataType in signature in the near future.
    //
    public getTClassByDynamo(dynamo: Item): any {
        // Collect all signature of dynamo properties.
        const targetPropertySignatures: string[] = [];
        for (const dynamoPropertyName in dynamo) {
            // Calc signature.
            targetPropertySignatures.push(dynamoPropertyName);
        }
        targetPropertySignatures.sort();
        const targetSignature: string = targetPropertySignatures.join(";");

        // At first, find from cache.
        let targetTClass: any = this.getTClassByDynamoCache.get(targetSignature);
        if (targetTClass !== undefined) return targetTClass;

        // If not in the cache, navigate to the uncached TClasses.
        for (const entityDescriptor of this.meta.values()) {
            if (entityDescriptor.isStructureCached === true) continue;

            // Calc signature.
            const uncachedClassPropertySignatures: string[] = [];
            if (entityDescriptor.hash) {
                uncachedClassPropertySignatures.push(entityDescriptor.hash.dynamoPropertyName);
            }
            if (entityDescriptor.range) {
                uncachedClassPropertySignatures.push(entityDescriptor.range.dynamoPropertyName);
            }
            entityDescriptor.attrs?.forEach((attr) => {
                uncachedClassPropertySignatures.push(attr.dynamoPropertyName);
            });

            // Normalize.
            uncachedClassPropertySignatures.sort();
            const uncachedClassSignature: string = uncachedClassPropertySignatures.join(";");

            // Conflict check.
            const conflictTClass = this.getTClassByDynamoCache.get(uncachedClassSignature);
            if (conflictTClass !== undefined) {
                if (entityDescriptor.TClass) {
                    throw new Error(
                        `Entity structure conflict. -> [${conflictTClass.name}, ${entityDescriptor.TClass.name}]`
                    );
                } else {
                    throw new Error(
                        `Entity structure conflict. but cannot get detail error information. -> [${conflictTClass.name}, ???] maybe @DynamoEntity is missing on somewhere.`
                    );
                }
            }

            // Caching.
            if (entityDescriptor.TClass) {
                this.getTClassByDynamoCache.set(uncachedClassSignature, entityDescriptor.TClass);
                entityDescriptor.isStructureCached = true;
            } else {
                throw new Error(
                    `Cahing on getTClassByDynamoCache is failed. maybe @DynamoEntity is missing on somewhere.`
                );
            }
        }

        // Retry, find from cache.
        targetTClass = this.getTClassByDynamoCache.get(targetSignature);
        if (targetSignature !== undefined) return targetTClass;
        else {
            throw new Error(`No such structure. [${targetPropertySignatures}]`);
        }
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
