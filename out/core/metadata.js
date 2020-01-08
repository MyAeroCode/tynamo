"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const key_1 = require("./key");
const utils_1 = require("./utils");
class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist.
     */
    registEntity(TClass, particialTableInfo = {}) {
        // Default Table Information.
        if (particialTableInfo.TableName === undefined)
            particialTableInfo.TableName = TClass.name;
        if (particialTableInfo.ProvisionedThroughput === undefined) {
            particialTableInfo.ProvisionedThroughput = {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            };
        }
        Reflect.defineMetadata(key_1.MetaDataKey.TClass, TClass, TClass);
        Reflect.defineMetadata(key_1.MetaDataKey.TableInformation, particialTableInfo, TClass);
    }
    /**
     * Insert one Property Descriptor.
     * It can be merged if it does not conflict.
     */
    registProperty(TClass, sourcePropertyName, args) {
        const reflectedSourceDataType = Reflect.getMetadata("design:type", new TClass(), sourcePropertyName);
        if (args.dataType === undefined) {
            if (reflectedSourceDataType === String)
                args.dataType = type_1.DataType.S;
            else if (reflectedSourceDataType === Number)
                args.dataType = type_1.DataType.N;
            else if (reflectedSourceDataType === Boolean)
                args.dataType = type_1.DataType.BOOL;
            else
                throw new Error(`please specify dataType of [${TClass.name}.${sourcePropertyName}]`);
        }
        // Check.
        // DataType.L must be specify sourceDataType.
        if (args.dataType === type_1.DataType.L && args.sourceDataType === undefined) {
            throw new Error(`DataType.L[${TClass.name}.${sourcePropertyName}] is must specify sourceDataType`);
        }
        // Check.
        // Key is not nullable.
        if (args.keyType !== type_1.KeyType.attr && args.nullable === true) {
            throw new Error(`${args.keyType}[${TClass.name}.${sourcePropertyName}] is should non-nullable`);
        }
        const propertyDescriptor = {
            nullable: args.nullable === true,
            serializer: args.serializer ? args.serializer : utils_1.defaultSerializer,
            deserializer: args.deserializer ? args.deserializer : utils_1.defaultDeserializer,
            sourceDataType: args.sourceDataType ? args.sourceDataType : reflectedSourceDataType,
            dynamoDataType: args.dataType,
            dynamoKeyType: args.keyType,
            dynamoPropertyName: args.propertyName ? args.propertyName : sourcePropertyName,
            sourcePropertyName: sourcePropertyName
        };
        this.propertyConflictTest(TClass, propertyDescriptor);
        //
        const propertyType = propertyDescriptor.dynamoKeyType;
        if (propertyType === type_1.KeyType.hash) {
            Reflect.defineMetadata(key_1.MetaDataKey.Hash, propertyDescriptor, TClass);
        }
        if (propertyType === type_1.KeyType.sort) {
            Reflect.defineMetadata(key_1.MetaDataKey.Sort, propertyDescriptor, TClass);
        }
        if (propertyType === type_1.KeyType.attr) {
            const attr = Reflect.getMetadata(key_1.MetaDataKey.Attr, TClass);
            attr.push(propertyDescriptor);
        }
        Reflect.defineMetadata(key_1.MetaDataKey.PropertyDescriptor, propertyDescriptor, TClass, sourcePropertyName);
    }
    /**
     * Examine for conflicting property.
     * Test if the duplicate keyType or propertyName.
     */
    propertyConflictTest(TClass, propertyDescriptor) {
        if (Reflect.getMetadata(key_1.MetaDataKey.Attr, TClass) === undefined) {
            Reflect.defineMetadata(key_1.MetaDataKey.Attr, [], TClass);
        }
        const hash = Reflect.getMetadata(key_1.MetaDataKey.Hash, TClass);
        const sort = Reflect.getMetadata(key_1.MetaDataKey.Sort, TClass);
        const attr = Reflect.getMetadata(key_1.MetaDataKey.Attr, TClass);
        const propertyType = propertyDescriptor.dynamoKeyType;
        // test property key type is duplicated.
        if (hash && propertyType === type_1.KeyType.hash)
            throw new Error(`hash key duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}] and [${TClass.name}.${hash.sourcePropertyName}]`);
        if (sort && propertyType === type_1.KeyType.sort)
            throw new Error(`sort key duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}] and [${TClass.name}.${sort.sourcePropertyName}]`);
        // test property name is duplicated.
        const set = new Set();
        if (hash)
            set.add(hash.dynamoPropertyName);
        if (sort)
            set.add(sort.dynamoPropertyName);
        attr.forEach((property) => set.add(property.dynamoPropertyName));
        if (set.has(propertyDescriptor.dynamoPropertyName))
            throw new Error(`property name duplicated. [${TClass.name}.${propertyDescriptor.sourcePropertyName}]`);
    }
    /**
     * Get the Entity Descriptor associated with a given constructor.
     */
    getEntityDescriptorByTClass(TClass) {
        if (Reflect.getMetadata(key_1.MetaDataKey.TClass, TClass) === undefined)
            throw new Error(`Can not find ClassInfo. Maybe @DynamoEntity is missing on [${TClass.name}]`);
        if (Reflect.getMetadata(key_1.MetaDataKey.Hash, TClass) === undefined)
            throw new Error(`No hashKey in [${TClass.name}]`);
        return {
            TClass: Reflect.getMetadata(key_1.MetaDataKey.TClass, TClass),
            hash: Reflect.getMetadata(key_1.MetaDataKey.Hash, TClass),
            sort: Reflect.getMetadata(key_1.MetaDataKey.Sort, TClass),
            attr: Reflect.getMetadata(key_1.MetaDataKey.Attr, TClass)
        };
    }
    /**
     * Get the TableInfo associated with a given constructor.
     * TableInfo contain informations for create table. (tableName, billingmode, ...)
     */
    getTableInfoByConstructor(TClass) {
        const tableInformation = Reflect.getMetadata(key_1.MetaDataKey.TableInformation, TClass);
        if (tableInformation === undefined) {
            throw new Error(`Maybe missing @DynamoEntity on [${TClass.name}]`);
        }
        return tableInformation;
    }
    /**
     * Get the keys associated with a given constructor.
     * It contain hash key, and maybe contain sort key.
     */
    getKeysByTClass(TClass) {
        const entityDescriptor = this.getEntityDescriptorByTClass(TClass);
        const keys = [];
        keys.push(entityDescriptor.hash);
        if (entityDescriptor.sort)
            keys.push(entityDescriptor.sort);
        return keys;
    }
    getAllPropertyNamesByTClass(TClass) {
        const set = new Set();
        const entityDescriptor = this.getEntityDescriptorByTClass(TClass);
        set.add(entityDescriptor.hash.dynamoPropertyName);
        if (entityDescriptor.sort)
            set.add(entityDescriptor.sort.dynamoPropertyName);
        entityDescriptor.attr.forEach((v) => set.add(v.dynamoPropertyName));
        return set;
    }
}
const _ = new MetaData();
exports.default = _;
//# sourceMappingURL=metadata.js.map