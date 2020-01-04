"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("../type");
const key_1 = require("../key");
const utils_1 = require("./utils");
class MetaData {
    // Attch TClass(constructable) into EntityDescriptor.
    // It is for create a new object through TClass.
    //
    registEntity(TClass) {
        const TClassConstructor = new TClass().constructor;
        Reflect.defineMetadata(key_1.MetaDataKey.TClass, TClass, TClassConstructor);
    }
    // Insert one Property Descriptor.
    // It can be merged if it does not conflict.
    //
    registProperty(TClassConstructor, sourcePropertyName, args) {
        const predictSourceDataType = Reflect.getMetadata("design:type", new TClassConstructor(), sourcePropertyName);
        if (args.dataType === undefined) {
            if (predictSourceDataType === String)
                args.dataType = type_1.DataType.S;
            else if (predictSourceDataType === Number)
                args.dataType = type_1.DataType.N;
            else if (predictSourceDataType === Boolean)
                args.dataType = type_1.DataType.BOOL;
            else
                throw new Error();
        }
        // Check.
        // DataType.L must be specify sourceDataType.
        if (args.dataType === type_1.DataType.L && args.sourceDataType === undefined) {
            throw new Error();
        }
        // Check.
        // Key is not nullable.
        if (args.keyType !== type_1.KeyType.attr && args.nullable === true) {
            throw new Error();
        }
        const propertyDescriptor = {
            nullable: args.nullable === true,
            serializer: args.serializer ? args.serializer : utils_1.defaultSerializer,
            deserializer: args.deserializer ? args.deserializer : utils_1.defaultDeserializer,
            sourceDataType: args.sourceDataType ? args.sourceDataType : predictSourceDataType,
            dynamoDataType: args.dataType,
            dynamoKeyType: args.keyType,
            dynamoPropertyName: args.propertyName ? args.propertyName : sourcePropertyName,
            sourcePropertyName: sourcePropertyName
        };
        this.propertyConflictTest(TClassConstructor, propertyDescriptor);
        //
        const propertyType = propertyDescriptor.dynamoKeyType;
        if (propertyType === type_1.KeyType.hash) {
            Reflect.defineMetadata(key_1.MetaDataKey.Hash, propertyDescriptor, TClassConstructor);
        }
        if (propertyType === type_1.KeyType.sort) {
            Reflect.defineMetadata(key_1.MetaDataKey.Sort, propertyDescriptor, TClassConstructor);
        }
        if (propertyType === type_1.KeyType.attr) {
            const attr = Reflect.getMetadata(key_1.MetaDataKey.Attr, TClassConstructor);
            attr.push(propertyDescriptor);
        }
        Reflect.defineMetadata(key_1.MetaDataKey.PropertyDescriptor, propertyDescriptor, TClassConstructor, sourcePropertyName);
    }
    // Examine for conflicting property.
    // Test if the duplicate keyType or propertyName.
    //
    propertyConflictTest(TClassConstructor, propertyDescriptor) {
        if (Reflect.getMetadata(key_1.MetaDataKey.Attr, TClassConstructor) === undefined) {
            Reflect.defineMetadata(key_1.MetaDataKey.Attr, [], TClassConstructor);
        }
        const hash = Reflect.getMetadata(key_1.MetaDataKey.Hash, TClassConstructor);
        const sort = Reflect.getMetadata(key_1.MetaDataKey.Sort, TClassConstructor);
        const attr = Reflect.getMetadata(key_1.MetaDataKey.Attr, TClassConstructor);
        const propertyType = propertyDescriptor.dynamoKeyType;
        // test property key type is duplicated.
        if (hash && propertyType === type_1.KeyType.hash)
            throw new Error();
        if (sort && propertyType === type_1.KeyType.sort)
            throw new Error();
        // test property name is duplicated.
        const set = new Set();
        if (hash)
            set.add(hash.dynamoPropertyName);
        if (sort)
            set.add(sort.dynamoPropertyName);
        attr.forEach((property) => set.add(property.dynamoPropertyName));
        if (set.has(propertyDescriptor.dynamoPropertyName))
            throw new Error();
    }
    // Gets the Entity Descriptor associated with a given object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    getEntityDescriptorByConstructor(TClassConstructor) {
        if (Reflect.getMetadata(key_1.MetaDataKey.TClass, TClassConstructor) === undefined)
            throw new Error();
        if (Reflect.getMetadata(key_1.MetaDataKey.Hash, TClassConstructor) === undefined)
            throw new Error();
        return {
            TClass: Reflect.getMetadata(key_1.MetaDataKey.TClass, TClassConstructor),
            hash: Reflect.getMetadata(key_1.MetaDataKey.Hash, TClassConstructor),
            sort: Reflect.getMetadata(key_1.MetaDataKey.Sort, TClassConstructor),
            attr: Reflect.getMetadata(key_1.MetaDataKey.Attr, TClassConstructor)
        };
    }
}
const metaData = new MetaData();
exports.default = metaData;
//# sourceMappingURL=metadata.js.map