import { PropertyDescriptor, EntityDescriptor, PropertyType, Item, DataType } from "../type";

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
        if (entityDescriptor === undefined) {
            throw new Error(`Unregistered class [${propertyDescriptor.TClassName}]`);
        }

        // Simplify variable name.
        const thisDynamoPropertyName: string = propertyDescriptor.dynamoPropertyName;
        const thisDynamoPropertyType: PropertyType = propertyDescriptor.dynamoPropertyType;
        const thisTClassName: string = propertyDescriptor.TClassName;
        const HASH: PropertyDescriptor<TSource> | undefined = entityDescriptor.hash;
        const RANGE: PropertyDescriptor<TSource> | undefined = entityDescriptor.range;
        const ATTRS: Map<string, PropertyDescriptor<TSource>> | undefined = entityDescriptor.attrs;

        // Validation check.
        // KeyType is must non-nullable.
        if (
            (thisDynamoPropertyType === PropertyType.hash || thisDynamoPropertyType === PropertyType.range) &&
            propertyDescriptor.nullable
        ) {
            throw new Error(
                `KeyType is must non-nullable. -> [${thisTClassName}.${propertyDescriptor.sourcePropertyName}]`
            );
        }

        // Test for KeyType.
        if (
            (thisDynamoPropertyType === PropertyType.hash && HASH) ||
            (thisDynamoPropertyType === PropertyType.range && RANGE)
        ) {
            throw new Error(`Duplicate ${thisDynamoPropertyType} Key of [${thisTClassName}].`);
        }

        // Test for DynamoPropertyName.
        const dynamoPropertyNameSet: Set<string> = new Set<string>();
        if (HASH) dynamoPropertyNameSet.add(HASH.dynamoPropertyName);
        if (RANGE) dynamoPropertyNameSet.add(RANGE.dynamoPropertyName);
        ATTRS?.forEach((attr) => dynamoPropertyNameSet.add(attr.dynamoPropertyName));
        if (dynamoPropertyNameSet.has(thisDynamoPropertyName)) {
            throw new Error(`Duplicate DynamoPropertyName of ${thisDynamoPropertyType}. -> ${thisDynamoPropertyName}`);
        }
    }

    // Attch TClass(constructable) into EntityDescriptor.
    // It is for create a new object through TClass.
    //
    public registEntity(TClass: any) {
        let entityDescriptor: EntityDescriptor<any> | undefined = this.meta.get(TClass.name);
        if (entityDescriptor === undefined) {
            // If this is the first time, generate meta data.
            this.meta.set(TClass.name, {
                TClass: TClass,
                attrs: new Map<string, PropertyDescriptor<any>>()
            });
        } else {
            // If not, update meta data.
            entityDescriptor.TClass = TClass;
        }
    }

    // Insert one Property Descriptor.
    // It can be merged if it does not conflict.
    //
    public registProperty<TSource>(propertyDescriptor: PropertyDescriptor<TSource>) {
        // If this is the first time, generate meta data.
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

        const thisFieldType: PropertyType = propertyDescriptor.dynamoPropertyType;
        switch (thisFieldType) {
            case PropertyType.hash:
                entityDescriptor.hash = propertyDescriptor;
                break;

            case PropertyType.range:
                entityDescriptor.range = propertyDescriptor;
                break;

            case PropertyType.attr:
                entityDescriptor.attrs!!.set(propertyDescriptor.dynamoPropertyName, propertyDescriptor);
                break;

            default:
                throw new Error(`No such property type [${thisFieldType}]`);
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
            throw new Error(`No metadata for ${object.constructor.name}. Make sure @DynamoEntity is append correctly.`);
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
    public getTClassByDynamoItem(dynamo: Item): any {
        // Check if, object is empty.
        if (dynamo === undefined) {
            throw new Error(`Empty object is not allowed`);
        }

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
    public getAllPropertiesByEntityDescriptor(entityDescriptor: EntityDescriptor<any>): PropertyDescriptor<any>[] {
        const allFields: PropertyDescriptor<any>[] = [];
        if (entityDescriptor.hash) allFields.push(entityDescriptor.hash);
        if (entityDescriptor.range) allFields.push(entityDescriptor.range);
        if (entityDescriptor.attrs) allFields.push(...entityDescriptor.attrs.values());

        return allFields;
    }

    public getPropertyDescriptorBySourceAndSourcePropertyName<TSource>(
        source: TSource,
        sourcePropertyName: keyof TSource
    ) {
        const entityDescriptor: EntityDescriptor<TSource> = this.getEntityDescriptorByHolder(source);
        const HASH: PropertyDescriptor<TSource> | undefined = entityDescriptor.hash;
        const RANGE: PropertyDescriptor<TSource> | undefined = entityDescriptor.range;
        const ATTRS: Map<string, PropertyDescriptor<TSource>> | undefined = entityDescriptor.attrs;

        if (HASH && HASH.sourcePropertyName === sourcePropertyName) return HASH;
        if (RANGE && RANGE.sourcePropertyName === sourcePropertyName) return RANGE;
        if (ATTRS) {
            for (const attr of ATTRS.values()) {
                if (attr.sourcePropertyName === sourcePropertyName) return attr;
            }
        }

        throw new Error(
            `No such mapped property -> [${entityDescriptor.TClass.name}.${sourcePropertyName}]. missing @DynamoProperty?`
        );
    }
}

const metaData = new MetaData();
export default metaData;
