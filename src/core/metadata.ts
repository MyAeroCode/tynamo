import { PropertyDescriptor, EntityDescriptor, KeyType, Item, DataType, PropertyDecoratorArgs } from "../type";
import { MetaDataKey } from "../key";
import { defaultSerializer, defaultDeserializer } from "./utils";

class MetaData {
    // Attch TClass(constructable) into EntityDescriptor.
    // It is for create a new object through TClass.
    //
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
            else throw new Error();
        }

        // Check.
        // DataType.L must be specify sourceDataType.
        if (args.dataType === DataType.L && args.sourceDataType === undefined) {
            throw new Error();
        }

        // Check.
        // Key is not nullable.
        if (args.keyType !== KeyType.attr && args.nullable === true) {
            throw new Error();
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
        if (hash && propertyType === KeyType.hash) throw new Error();
        if (sort && propertyType === KeyType.sort) throw new Error();

        // test property name is duplicated.
        const set: Set<string> = new Set<string>();
        if (hash) set.add(hash.dynamoPropertyName);
        if (sort) set.add(sort.dynamoPropertyName);
        attr.forEach((property) => set.add(property.dynamoPropertyName));
        if (set.has(propertyDescriptor.dynamoPropertyName)) throw new Error();
    }

    // Gets the Entity Descriptor associated with a given object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    public getEntityDescriptorByConstructor<TSource>(TClassConstructor: any): EntityDescriptor<TSource> {
        if (Reflect.getMetadata(MetaDataKey.TClass, TClassConstructor) === undefined) throw new Error();
        if (Reflect.getMetadata(MetaDataKey.Hash, TClassConstructor) === undefined) throw new Error();
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
