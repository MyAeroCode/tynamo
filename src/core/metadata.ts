import {
    PropertyDescriptor,
    EntityDescriptor,
    KeyType,
    DataType,
    PropertyDecoratorArgs,
    TableInformation,
    ClassCapture
} from "./type";
import { MetaDataKey } from "./key";
import { defaultSerializer, defaultDeserializer } from "./utils";

class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist.
     */
    public registEntity<TSource>(
        TClass: ClassCapture<TSource>,
        particialTableInfo: Partial<TableInformation> = {}
    ): void {
        // Default Table Information.
        if (particialTableInfo.TableName === undefined) particialTableInfo.TableName = TClass.name;
        if (particialTableInfo.ProvisionedThroughput === undefined) {
            particialTableInfo.ProvisionedThroughput = {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            };
        }

        Reflect.defineMetadata(MetaDataKey.TClass, TClass, TClass);
        Reflect.defineMetadata(MetaDataKey.TableInformation, particialTableInfo, TClass);
    }

    /**
     * Insert one Property Descriptor.
     * It can be merged if it does not conflict.
     */
    public registProperty<TSource>(
        TClass: ClassCapture<TSource>,
        sourcePropertyName: string,
        args: PropertyDecoratorArgs
    ): void {
        const reflectedSourceDataType = Reflect.getMetadata("design:type", new TClass(), sourcePropertyName);

        if (args.dataType === undefined) {
            if (reflectedSourceDataType === String) args.dataType = DataType.S;
            else if (reflectedSourceDataType === Number) args.dataType = DataType.N;
            else if (reflectedSourceDataType === Boolean) args.dataType = DataType.BOOL;
            else throw new Error(`please specify dataType of [${TClass.name}.${sourcePropertyName}]`);
        }

        // Check.
        // DataType.L must be specify sourceDataType.
        if (args.dataType === DataType.L && args.sourceDataType === undefined) {
            throw new Error(`DataType.L[${TClass.name}.${sourcePropertyName}] is must specify sourceDataType`);
        }

        // Check.
        // Key is not nullable.
        if (args.keyType !== KeyType.attr && args.nullable === true) {
            throw new Error(`${args.keyType}[${TClass.name}.${sourcePropertyName}] is should non-nullable`);
        }

        const propertyDescriptor: PropertyDescriptor<any, any> = {
            nullable: args.nullable === true,
            serializer: args.serializer ? args.serializer : defaultSerializer,
            deserializer: args.deserializer ? args.deserializer : defaultDeserializer,
            sourceDataType: args.sourceDataType ? args.sourceDataType : reflectedSourceDataType,
            dynamoDataType: args.dataType,
            dynamoKeyType: args.keyType,
            dynamoPropertyName: args.propertyName ? args.propertyName : sourcePropertyName,
            sourcePropertyName: sourcePropertyName
        };
        this.propertyConflictTest(TClass, propertyDescriptor);

        //
        const propertyType = propertyDescriptor.dynamoKeyType;
        if (propertyType === KeyType.hash) {
            Reflect.defineMetadata(MetaDataKey.Hash, propertyDescriptor, TClass);
        }
        if (propertyType === KeyType.sort) {
            Reflect.defineMetadata(MetaDataKey.Sort, propertyDescriptor, TClass);
        }
        if (propertyType === KeyType.attr) {
            const attr: PropertyDescriptor<any, any>[] = Reflect.getMetadata(MetaDataKey.Attr, TClass);
            attr.push(propertyDescriptor);
        }
        Reflect.defineMetadata(MetaDataKey.PropertyDescriptor, propertyDescriptor, TClass, sourcePropertyName);
    }

    /**
     * Examine for conflicting property.
     * Test if the duplicate keyType or propertyName.
     */
    private propertyConflictTest<TSource>(
        TClass: ClassCapture<TSource>,
        propertyDescriptor: PropertyDescriptor<TSource, any>
    ) {
        if (Reflect.getMetadata(MetaDataKey.Attr, TClass) === undefined) {
            Reflect.defineMetadata(MetaDataKey.Attr, [], TClass);
        }
        const hash: PropertyDescriptor<any, any> | undefined = Reflect.getMetadata(MetaDataKey.Hash, TClass);
        const sort: PropertyDescriptor<any, any> | undefined = Reflect.getMetadata(MetaDataKey.Sort, TClass);
        const attr: PropertyDescriptor<any, any>[] = Reflect.getMetadata(MetaDataKey.Attr, TClass);
        const propertyType: KeyType = propertyDescriptor.dynamoKeyType;

        // test property key type is duplicated.
        if (hash && propertyType === KeyType.hash)
            throw new Error(
                `hash key duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}] and [${TClass.name}.${hash.sourcePropertyName}]`
            );
        if (sort && propertyType === KeyType.sort)
            throw new Error(
                `sort key duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}] and [${TClass.name}.${sort.sourcePropertyName}]`
            );

        // test property name is duplicated.
        const set: Set<string> = new Set<string>();
        if (hash) set.add(hash.dynamoPropertyName);
        if (sort) set.add(sort.dynamoPropertyName);
        attr.forEach((property) => set.add(property.dynamoPropertyName));
        if (set.has(propertyDescriptor.dynamoPropertyName))
            throw new Error(`property name duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}]`);
    }

    /**
     * Get the Entity Descriptor associated with a given constructor.
     */
    public getEntityDescriptorByConstructor<TSource>(TClass: ClassCapture<TSource>): EntityDescriptor<TSource> {
        if (Reflect.getMetadata(MetaDataKey.TClass, TClass) === undefined)
            throw new Error(`Can not find ClassInfo. Maybe @DynamoEntity is missing on [${TClass.name}]`);
        if (Reflect.getMetadata(MetaDataKey.Hash, TClass) === undefined)
            throw new Error(`No hashKey in [${TClass.name}]`);
        return {
            TClass: Reflect.getMetadata(MetaDataKey.TClass, TClass),
            hash: Reflect.getMetadata(MetaDataKey.Hash, TClass),
            sort: Reflect.getMetadata(MetaDataKey.Sort, TClass),
            attr: Reflect.getMetadata(MetaDataKey.Attr, TClass)
        };
    }

    /**
     * Get the TableInfo associated with a given constructor.
     * TableInfo contain informations for create table. (tableName, billingmode, ...)
     */
    public getTableInfoByConstructor<TSource>(TClass: ClassCapture<TSource>): TableInformation {
        const tableInformation: TableInformation | undefined = Reflect.getMetadata(
            MetaDataKey.TableInformation,
            TClass
        );
        if (tableInformation === undefined) {
            throw new Error(`Maybe missing @DynamoEntity on [${TClass.name}]`);
        }
        return tableInformation;
    }

    /**
     * Get the keys associated with a given constructor.
     * It contain hash key, and maybe contain sort key.
     */
    public getKeysByConstructor<TSource>(TClass: ClassCapture<TSource>): PropertyDescriptor<any, any>[] {
        const entityDescriptor: EntityDescriptor<TSource> = this.getEntityDescriptorByConstructor(TClass);
        const keys: PropertyDescriptor<any, any>[] = [];
        keys.push(entityDescriptor.hash);
        if (entityDescriptor.sort) keys.push(entityDescriptor.sort);
        return keys;
    }
}

const _ = new MetaData();
export default _;
