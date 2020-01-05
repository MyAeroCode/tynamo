import { PropertyDescriptor, EntityDescriptor, KeyType, DataType, PropertyDecoratorArgs } from "../type";
import { MetaDataKey } from "../key";
import { defaultSerializer, defaultDeserializer } from "./utils";

class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist. (todo)
     */
    public registEntity(TClass: any): void {
        const TClassConstructor: any = new TClass().constructor;
        Reflect.defineMetadata(MetaDataKey.TClass, TClass, TClassConstructor);
    }

    // Insert one Property Descriptor.
    // It can be merged if it does not conflict.
    //
    public registProperty(TClassConstructor: any, sourcePropertyName: string, args: PropertyDecoratorArgs<any>): void {
        const predictSourceDataType = Reflect.getMetadata("design:type", new TClassConstructor(), sourcePropertyName);
        if (args.dataType === undefined) {
            if (predictSourceDataType === String) args.dataType = DataType.S;
            else if (predictSourceDataType === Number) args.dataType = DataType.N;
            else if (predictSourceDataType === Boolean) args.dataType = DataType.BOOL;
            else throw new Error(`please specify dataType of [${TClassConstructor.name}.${sourcePropertyName}]`);
        }

        // Check.
        // DataType.L must be specify sourceDataType.
        if (args.dataType === DataType.L && args.sourceDataType === undefined) {
            throw new Error(
                `DataType.L[${TClassConstructor.name}.${sourcePropertyName}] is must specify sourceDataType`
            );
        }

        // Check.
        // Key is not nullable.
        if (args.keyType !== KeyType.attr && args.nullable === true) {
            throw new Error(`${args.keyType}[${TClassConstructor.name}.${sourcePropertyName}] is should non-nullable`);
        }

        const propertyDescriptor: PropertyDescriptor<any> = {
            nullable: args.nullable === true,
            serializer: args.serializer ? args.serializer : defaultSerializer,
            deserializer: args.deserializer ? args.deserializer : defaultDeserializer,
            sourceDataType: args.sourceDataType ? args.sourceDataType : predictSourceDataType,
            dynamoDataType: args.dataType,
            dynamoKeyType: args.keyType,
            dynamoPropertyName: args.propertyName ? args.propertyName : sourcePropertyName,
            sourcePropertyName: sourcePropertyName
        };
        this.propertyConflictTest(TClassConstructor, propertyDescriptor);

        //
        const propertyType = propertyDescriptor.dynamoKeyType;
        if (propertyType === KeyType.hash) {
            Reflect.defineMetadata(MetaDataKey.Hash, propertyDescriptor, TClassConstructor);
        }
        if (propertyType === KeyType.sort) {
            Reflect.defineMetadata(MetaDataKey.Sort, propertyDescriptor, TClassConstructor);
        }
        if (propertyType === KeyType.attr) {
            const attr: PropertyDescriptor<any>[] = Reflect.getMetadata(MetaDataKey.Attr, TClassConstructor);
            attr.push(propertyDescriptor);
        }
        Reflect.defineMetadata(
            MetaDataKey.PropertyDescriptor,
            propertyDescriptor,
            TClassConstructor,
            sourcePropertyName
        );
    }

    // Examine for conflicting property.
    // Test if the duplicate keyType or propertyName.
    //
    private propertyConflictTest<TSource>(TClassConstructor: any, propertyDescriptor: PropertyDescriptor<TSource>) {
        if (Reflect.getMetadata(MetaDataKey.Attr, TClassConstructor) === undefined) {
            Reflect.defineMetadata(MetaDataKey.Attr, [], TClassConstructor);
        }
        const hash: PropertyDescriptor<any> | undefined = Reflect.getMetadata(MetaDataKey.Hash, TClassConstructor);
        const sort: PropertyDescriptor<any> | undefined = Reflect.getMetadata(MetaDataKey.Sort, TClassConstructor);
        const attr: PropertyDescriptor<any>[] = Reflect.getMetadata(MetaDataKey.Attr, TClassConstructor);
        const propertyType: KeyType = propertyDescriptor.dynamoKeyType;

        // test property key type is duplicated.
        if (hash && propertyType === KeyType.hash)
            throw new Error(
                `hash key duplicated. [${TClassConstructor.name}.${propertyDescriptor.sourcePropertyName}] and [${TClassConstructor.name}.${hash.sourcePropertyName}]`
            );
        if (sort && propertyType === KeyType.sort)
            throw new Error(
                `sort key duplicated. [${TClassConstructor.name}.${propertyDescriptor.sourcePropertyName}] and [${TClassConstructor.name}.${sort.sourcePropertyName}]`
            );

        // test property name is duplicated.
        const set: Set<string> = new Set<string>();
        if (hash) set.add(hash.dynamoPropertyName);
        if (sort) set.add(sort.dynamoPropertyName);
        attr.forEach((property) => set.add(property.dynamoPropertyName));
        if (set.has(propertyDescriptor.dynamoPropertyName))
            throw new Error(
                `property name duplicated. [${TClassConstructor.name}.${propertyDescriptor.sourcePropertyName}]`
            );
    }

    // Gets the Entity Descriptor associated with a given object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    public getEntityDescriptorByConstructor<TSource>(TClassConstructor: any): EntityDescriptor<TSource> {
        if (Reflect.getMetadata(MetaDataKey.TClass, TClassConstructor) === undefined)
            throw new Error(`Can not find ClassInfo. Maybe @DynamoEntity is missing on [${TClassConstructor.name}]`);
        if (Reflect.getMetadata(MetaDataKey.Hash, TClassConstructor) === undefined)
            throw new Error(`No hashKey in [${TClassConstructor.name}]`);
        return {
            TClass: Reflect.getMetadata(MetaDataKey.TClass, TClassConstructor),
            hash: Reflect.getMetadata(MetaDataKey.Hash, TClassConstructor),
            sort: Reflect.getMetadata(MetaDataKey.Sort, TClassConstructor),
            attr: Reflect.getMetadata(MetaDataKey.Attr, TClassConstructor)
        };
    }
}

const metaData = new MetaData();
export default metaData;
