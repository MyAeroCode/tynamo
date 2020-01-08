"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const metadata_1 = __importDefault(require("./metadata"));
const utils_1 = require("./utils");
const key_1 = require("./key");
/**
 * Performs the interconversion between source and DynamoObject.
 */
class Mapper {
    formationNumber(source) {
        return { N: String(source) };
    }
    formationString(source) {
        return { S: source };
    }
    formationBinary(source) {
        return { B: source };
    }
    formationBoolean(source) {
        return { BOOL: source };
    }
    formationNumberSet(source) {
        return { NS: source.map((v) => String(v)) };
    }
    formationStringSet(source) {
        return { SS: source };
    }
    formationBinarySet(source) {
        return { BS: source };
    }
    /**
     * Convert EntityArray to AttributeValue(L).
     * EntityArray should not contain scalar.
     *
     * For example,
     *  formationEntityArray([new Cat(0, "a"), new Cat(1, "b")], Cat) =>
     *  { L :
     *      [
     *          {M: {id:{N : "0"}, name:{S : "a"}}},
     *          {M: {id:{N : "1"}, name:{S : "b"}}}
     *      ]
     *  }
     */
    formationList(source, TClass) {
        return {
            [type_1.DataType.L]: source.map((v) => this.formationMap(v, TClass))
        };
    }
    /**
     * Convert DynamoEntity to AttributeValue(M).
     *
     * For example,
     *  formationMap(new Cat(0, "a"), Cat) =>
     *  { M :
     *      id   : {N : "0"},
     *      name : {S : "a"}
     *  }
     */
    formationMap(source, TClass) {
        return {
            M: this.formation(source, TClass)
        };
    }
    /**
     * Formate target property using parentSource and propertyDescriptor.
     */
    formationProperty(parent, propertyDescriptor) {
        const dynamoPropertyName = propertyDescriptor.dynamoPropertyName;
        // Serialize target property.
        const serialized = propertyDescriptor.serializer({
            source: parent,
            propertyDescriptor: propertyDescriptor
        });
        // Check)
        // Target property is null?
        // It is fine, when Target property is nullable.
        let realDataType = propertyDescriptor.dynamoDataType;
        if (serialized === undefined || serialized === null) {
            if (propertyDescriptor.nullable)
                realDataType = type_1.DataType.NULL;
            else
                throw new Error(`Non-nullable property sholud not NULL or undefined`);
        }
        // Check)
        // Target property is empty string?
        if (serialized === "") {
            throw new Error(`Empty string is not allowed.`);
        }
        // Create DynamoItem using by AttributeValue.
        function resolve(value) {
            return {
                [dynamoPropertyName]: value
            };
        }
        // Try formation.
        switch (realDataType) {
            case type_1.DataType.S:
                return resolve(this.formationString(serialized));
            case type_1.DataType.N:
                return resolve(this.formationNumber(serialized));
            case type_1.DataType.B:
                return resolve(this.formationBinary(serialized));
            case type_1.DataType.BOOL:
                return resolve(this.formationBoolean(serialized));
            case type_1.DataType.SS:
                return resolve(this.formationStringSet(serialized));
            case type_1.DataType.NS:
                return resolve(this.formationNumberSet(serialized));
            case type_1.DataType.BS:
                return resolve(this.formationBinarySet(serialized));
            case type_1.DataType.L:
                return resolve(this.formationList(serialized, propertyDescriptor.sourceDataType));
            case type_1.DataType.M:
                return resolve(this.formationMap(serialized, propertyDescriptor.sourceDataType));
            case type_1.DataType.NULL:
                return resolve({ NULL: true });
            default: {
                throw new Error(`Can not detect DataType.`);
            }
        }
    }
    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation(source, TClass, formationType = type_1.FormationMask.Full) {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }
        // Simplify variable name.
        const entityDescriptor = metadata_1.default.getEntityDescriptorByTClass(TClass);
        const HASH = entityDescriptor.hash;
        const RANGE = entityDescriptor.sort;
        const ATTRS = entityDescriptor.attr;
        // Apply FormationMask.
        const targetPropertyDescriptors = [];
        if (formationType & type_1.FormationMask.HashKey && HASH)
            targetPropertyDescriptors.push(HASH);
        if (formationType & type_1.FormationMask.RangeKey && RANGE)
            targetPropertyDescriptors.push(RANGE);
        if (formationType & type_1.FormationMask.Body)
            targetPropertyDescriptors.push(...ATTRS.values());
        // Try formation and merge.
        const dynamo = {};
        for (const propertyDescriptor of targetPropertyDescriptors) {
            const dynamoProperty = this.formationProperty(source, propertyDescriptor);
            Object.assign(dynamo, dynamoProperty);
        }
        return dynamo;
    }
    deformationNumber(target) {
        return Number(target.N);
    }
    deformationBinary(target) {
        return String(target.B);
    }
    deformationString(target) {
        return target.S;
    }
    deformationBoolean(target) {
        return target.BOOL;
    }
    deformationNumberSet(target) {
        return target.NS.map((v) => Number(v));
    }
    deformationBinarySet(target) {
        return target.BS.map((v) => String(v));
    }
    deformationStringSet(target) {
        return target.SS;
    }
    /**
     * Convert (L) to EntityArray.
     * L should have only one entity type.
     *
     * For example,
     *  deformationEntityArray({ L :
     *      [
     *          {M: {id:{N : "0"}, name:{S : "a"}}},
     *          {M: {id:{N : "1"}, name:{S : "b"}}}
     *      ]
     *  }, Cat) => [new Cat(0, "a"), new Cat(1, "b")]
     */
    deformationList(target, TClass) {
        return target[type_1.DataType.L].map((v) => this.deformationMap(v, TClass));
    }
    /**
     * Convert (M) to entity.
     *
     * For example,
     *  deformationMap({ M :
     *      id   : {N : "0"},
     *      name : {S : "a"}
     *  }, Cat) => new Cat(0, "a")
     */
    deformationMap(target, TClass) {
        return this.deformation(target.M, TClass);
    }
    /**
     * Deformate target property using parentAttributeMap and propertyDescriptor.
     */
    deformationProperty(parent, propertyDescriptor) {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data) {
            return {
                [sourcePropertyName]: data
            };
        }
        // Deserialize dynamoProperty.
        const deserialized = utils_1.fetchFromChunk(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });
        // Return deformationed.
        if (deserialized.S)
            return resolve(this.deformationString(deserialized));
        if (deserialized.N)
            return resolve(this.deformationNumber(deserialized));
        if (deserialized.B)
            return resolve(this.deformationBinary(deserialized));
        if (deserialized.SS)
            return resolve(this.deformationStringSet(deserialized));
        if (deserialized.NS)
            return resolve(this.deformationNumberSet(deserialized));
        if (deserialized.BS)
            return resolve(this.deformationBinarySet(deserialized));
        if (deserialized.BOOL)
            return resolve(this.deformationBoolean(deserialized));
        if (deserialized.NULL)
            return resolve(undefined);
        if (deserialized.L)
            return resolve(this.deformationList(deserialized, propertyDescriptor.sourceDataType));
        if (deserialized.M)
            return resolve(this.deformationMap(deserialized, propertyDescriptor.sourceDataType));
        return deserialized;
    }
    /**
     * Convert AttributeMap to DynamoEntity.
     */
    deformation(target, RootTClass) {
        // Check if, object is empty.
        if (target === undefined) {
            throw new Error(`Empty object is not allowed`);
        }
        // Validation check.
        // Is it registered in the metadata?
        const TClass = Reflect.getMetadata(key_1.MetaDataKey.TClass, RootTClass);
        const holder = new TClass();
        const entityDescriptor = metadata_1.default.getEntityDescriptorByTClass(holder.constructor);
        // Gets all field descriptor to create the Object.
        const propertyDescriptors = [];
        if (entityDescriptor.hash)
            propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.sort)
            propertyDescriptors.push(entityDescriptor.sort);
        if (entityDescriptor.attr)
            propertyDescriptors.push(...entityDescriptor.attr.values());
        // Then deformation and merge all fields.
        for (const propertyDescriptor of propertyDescriptors) {
            if (target[propertyDescriptor.dynamoPropertyName] !== undefined) {
                const sourceProperty = this.deformationProperty(target, propertyDescriptor);
                Object.assign(holder, sourceProperty);
            }
        }
        return holder;
    }
}
const _ = new Mapper();
exports.default = _;
//# sourceMappingURL=mapper.js.map