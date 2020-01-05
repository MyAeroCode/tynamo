"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("../type");
const metadata_1 = __importDefault(require("./metadata"));
const utils_1 = require("./utils");
const key_1 = require("../key");
/**
 * Performs the interconversion between source and DynamoObject.
 */
class Mapper {
    /**
     * Convert scalar to AttributeValue(N|S|B).
     * (Undefined | null | EmptyString) is not allowd.
     *
     * For example,
     *  formationScalar( 1 , DataType.N) => { N :  1 }
     *  formationScalar("2", DataType.S) => { S : "2"}
     *  formationScalar("3", DataType.B) => { B : "3"}
     */
    formationScalar(scalar, dataType) {
        if (scalar === undefined || scalar === null || scalar === "")
            throw new Error(`'${scalar}' is not allowed.`);
        switch (dataType) {
            case type_1.DataType.S:
            case type_1.DataType.N:
            case type_1.DataType.B: {
                return {
                    [dataType]: scalar.toString()
                };
            }
            case type_1.DataType.BOOL: {
                return {
                    [dataType]: scalar
                };
            }
        }
    }
    /**
     * Convert scalarArray to AttributeValue(NS|SS|BS).
     *
     * For example,
     *  formationScalarArray([ 1 ,  2 ], DataType.NS) => { NS : ["1", "2"] }
     *  formationScalarArray(["3", "4"], DataType.SS) => { SS : ["3", "4"] }
     *  formationScalarArray(["5", "6"], DataType.BS) => { BS : ["5", "6"] }
     */
    formationScalarArray(scalarArray, dataType) {
        return {
            [dataType]: scalarArray.map((v) => v.toString())
        };
    }
    /**
     * Convert EntityArray to AttributeValue(L).
     * EntityArray should not contain scalar.
     *
     * For example,
     *  formationEntityArray([new Cat(0, "a"), new Cat(1, "b")], Cat) =>
     *  { L :
     *      [
     *          {id:{N : "0"}, name:{S : "a"}},
     *          {id:{N : "1"}, name:{S : "b"}}
     *      ]
     *  }
     */
    formationEntityArray(entityArray, TClass) {
        return {
            [type_1.DataType.L]: entityArray.map((v) => this.formation(v, TClass))
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
        const children = propertyDescriptor.serializer({
            source: parent,
            propertyDescriptor: propertyDescriptor
        });
        // Check)
        // Target property is null?
        // It is fine, when Target property is nullable.
        let realDataType = propertyDescriptor.dynamoDataType;
        if (children === undefined || children === null) {
            if (propertyDescriptor.nullable)
                realDataType = type_1.DataType.NULL;
            else
                throw new Error(`Non-nullable property sholud not NULL or undefined`);
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
            case type_1.DataType.N:
            case type_1.DataType.B:
            case type_1.DataType.BOOL: {
                return resolve(this.formationScalar(children, realDataType));
            }
            case type_1.DataType.SS:
            case type_1.DataType.NS:
            case type_1.DataType.BS: {
                return resolve(this.formationScalarArray(children, realDataType));
            }
            case type_1.DataType.L: {
                return resolve(this.formationEntityArray(children, propertyDescriptor.sourceDataType));
            }
            case type_1.DataType.M: {
                return resolve(this.formationMap(children, propertyDescriptor.sourceDataType));
            }
            case type_1.DataType.NULL: {
                return resolve({
                    NULL: true
                });
            }
            default: {
                throw new Error(`Can not detect DataType.`);
            }
        }
    }
    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation(source, RootTClass, formationType = type_1.FormationMask.Full) {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }
        // Simplify variable name.
        const entityDescriptor = metadata_1.default.getEntityDescriptorByConstructor(RootTClass);
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
    /**
     * Convert (N|S|B) to scalar.
     *
     * For example,
     *  deformationScalar({N: "3"}, DataType.N) =>  3
     *  deformationScalar({S: "X"}, DataType.S) => "X"
     *  deformationScalar({B: "_"}, DataType.B) => "_"
     */
    deformationScalar(scalarValue, dataType) {
        if (scalarValue === undefined || scalarValue === undefined) {
            throw new Error(`'${scalarValue}' is not allowed.`);
        }
        switch (dataType) {
            case type_1.DataType.S:
            case type_1.DataType.B:
            case type_1.DataType.BOOL:
                return scalarValue[dataType];
            case type_1.DataType.N:
                return Number(scalarValue[dataType]);
        }
    }
    /**
     * Convert (SS|BS|SS) to scalarArray.
     *
     * For example,
     *  deformationScalarArray({NS: ["1", "3", "5"]}, DataType.NS) => [ 1 ,  3 ,  5 ]
     *  deformationScalarArray({SS: ["A", "B", "C"]}, DataType.SS) => ["A", "B", "C"]
     *  deformationScalarArray({BS: ["a", "b", "c"]}, DataType.BS) => ["a", "b", "c"]
     */
    deformationScalarArray(scalarArrayValue, dataType) {
        switch (dataType) {
            case type_1.DataType.SS:
            case type_1.DataType.BS: {
                return scalarArrayValue[dataType].map((v) => String(v));
            }
            case type_1.DataType.NS: {
                return scalarArrayValue[dataType].map((v) => Number(v));
            }
        }
    }
    /**
     * Convert (L) to EntityArray.
     * L should have only one entity type.
     *
     * For example,
     *  deformationEntityArray({ L :
     *      [
     *          {id:{N : "0"}, name:{S : "a"}},
     *          {id:{N : "1"}, name:{S : "b"}}
     *      ]
     *  }, Cat) => [new Cat(0, "a"), new Cat(1, "b")]
     */
    deformationEntityArray(entityArrayValue, TClass) {
        return entityArrayValue[type_1.DataType.L].map((v) => this.deformation(v, TClass));
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
    deformationMap(dynamo, TClass) {
        return this.deformation(dynamo.M, TClass);
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
        const deserialized = utils_1.fetchFromChunkOrValue(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });
        // Return deformationed.
        if (deserialized.S)
            return resolve(this.deformationScalar(deserialized, type_1.DataType.S));
        if (deserialized.N)
            return resolve(this.deformationScalar(deserialized, type_1.DataType.N));
        if (deserialized.B)
            return resolve(this.deformationScalar(deserialized, type_1.DataType.B));
        if (deserialized.SS)
            return resolve(this.deformationScalarArray(deserialized, type_1.DataType.SS));
        if (deserialized.NS)
            return resolve(this.deformationScalarArray(deserialized, type_1.DataType.NS));
        if (deserialized.BS)
            return resolve(this.deformationScalarArray(deserialized, type_1.DataType.BS));
        if (deserialized.L) {
            return resolve(this.deformationEntityArray(deserialized, propertyDescriptor.sourceDataType));
        }
        if (deserialized.M) {
            return resolve(this.deformationMap(deserialized, propertyDescriptor.sourceDataType));
        }
        if (deserialized.BOOL)
            return resolve(this.deformationScalar(deserialized, type_1.DataType.BOOL));
        if (deserialized.NULL)
            return resolve(undefined);
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
        const entityDescriptor = metadata_1.default.getEntityDescriptorByConstructor(holder.constructor);
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
            const sourceProperty = this.deformationProperty(target, propertyDescriptor);
            Object.assign(holder, sourceProperty);
        }
        return holder;
    }
}
const tynamoFormation = new Mapper();
exports.default = tynamoFormation;
//# sourceMappingURL=tynamo.js.map