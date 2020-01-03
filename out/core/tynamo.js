"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("../type");
const metadata_1 = __importDefault(require("./metadata"));
const utils_1 = require("./utils");
// Performs the interconversion between DynamoItem and the object.
//
class TynamoFormation {
    // Convert sourceScalar to dynamoScalar.
    //
    formationScalar(value, dataType) {
        if (value === undefined || value === null || value === "")
            throw new Error(`'${value}' is not allowed.`);
        switch (dataType) {
            case type_1.DataType.S:
            case type_1.DataType.N:
            case type_1.DataType.B: {
                return {
                    [dataType]: value.toString()
                };
            }
            case type_1.DataType.BOOL: {
                return {
                    [dataType]: value
                };
            }
        }
    }
    // Convert sourceList to dynamoList.
    //
    formationList(array, dataType) {
        switch (dataType) {
            case type_1.DataType.NS:
            case type_1.DataType.SS:
            case type_1.DataType.BS: {
                return {
                    [dataType]: array.map((v) => v.toString())
                };
            }
            case type_1.DataType.L: {
                return {
                    [dataType]: array.map((v) => this.formation(v))
                };
            }
        }
    }
    // Conver source to dynamoMap.
    //
    formationMap(source) {
        return {
            M: this.formation(source)
        };
    }
    // Convert sourceProperty to dynamoProperty.
    //
    formationProperty(parent, propertyDescriptor) {
        const dynamoPropertyName = propertyDescriptor.dynamoPropertyName;
        let realDataType = propertyDescriptor.dataType;
        // custom property serializer check.
        const source = utils_1.fetchFromChunkOrValue(propertyDescriptor.serializer, {
            source: parent,
            propertyDescriptor: propertyDescriptor
        });
        // null check.
        if (source === undefined || source === null) {
            if (propertyDescriptor.nullable)
                realDataType = type_1.DataType.NULL;
            else
                throw new Error(`Non-nullable property sholud not NULL or undefined`);
        }
        function resolve(value) {
            return {
                [dynamoPropertyName]: value
            };
        }
        switch (realDataType) {
            case type_1.DataType.S:
            case type_1.DataType.N:
            case type_1.DataType.B:
            case type_1.DataType.BOOL: {
                return resolve(this.formationScalar(source, realDataType));
            }
            case type_1.DataType.SS:
            case type_1.DataType.NS:
            case type_1.DataType.BS:
            case type_1.DataType.L: {
                return resolve(this.formationList(source, realDataType));
            }
            case type_1.DataType.M: {
                return resolve(this.formationMap(source));
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
    // Convert sourceObject to dynamoItem.
    //
    formation(source, formationType = type_1.FormationMask.Full) {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }
        const entityDescriptor = metadata_1.default.getEntityDescriptorByHolder(source);
        const propertyDescriptors = [];
        const HASH = entityDescriptor.hash;
        const RANGE = entityDescriptor.range;
        const ATTRS = entityDescriptor.attrs;
        if (formationType & type_1.FormationMask.HashKey && HASH)
            propertyDescriptors.push(HASH);
        if (formationType & type_1.FormationMask.RangeKey && RANGE)
            propertyDescriptors.push(RANGE);
        if (formationType & type_1.FormationMask.Body)
            propertyDescriptors.push(...ATTRS.values());
        const dynamo = {};
        for (const propertyDescriptor of propertyDescriptors) {
            const dynamoProperty = this.formationProperty(source, propertyDescriptor);
            Object.assign(dynamo, dynamoProperty);
        }
        return dynamo;
    }
    // Convert dynamoScalar to sourceScalar.
    //
    deformationScalar(value, dataType) {
        if (value === undefined || value === undefined)
            throw new Error(`'${value}' is not allowed.`);
        switch (dataType) {
            case type_1.DataType.S:
            case type_1.DataType.B:
            case type_1.DataType.BOOL:
                return value[dataType];
            case type_1.DataType.N:
                return Number(value[dataType]);
        }
    }
    // Convert dynamoList to sourceList.
    //
    deformationList(array, dataType) {
        switch (dataType) {
            case type_1.DataType.SS:
            case type_1.DataType.BS: {
                return array[dataType].map((v) => String(v));
            }
            case type_1.DataType.NS: {
                return array[dataType].map((v) => Number(v));
            }
            case type_1.DataType.L: {
                return array[dataType].map((v) => this.deformation(v));
            }
        }
    }
    // Convert dynamoMap to source.
    //
    deformationMap(dynamo) {
        return this.deformation(dynamo.M);
    }
    // Convert dynamoProperty to sourceProperty.
    //
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
            return resolve(this.deformationList(deserialized, type_1.DataType.SS));
        if (deserialized.NS)
            return resolve(this.deformationList(deserialized, type_1.DataType.NS));
        if (deserialized.BS)
            return resolve(this.deformationList(deserialized, type_1.DataType.BS));
        if (deserialized.L)
            return resolve(this.deformationList(deserialized, type_1.DataType.L));
        if (deserialized.M)
            return resolve(this.deformationMap(deserialized));
        if (deserialized.BOOL)
            return resolve(this.deformationScalar(deserialized, type_1.DataType.BOOL));
        if (deserialized.NULL)
            return resolve(undefined);
        return deserialized;
    }
    // Convert dynamoItem to sourceObject.
    //
    deformation(dynamo, TClass = metadata_1.default.getTClassByDynamoItem(dynamo)) {
        // Check if, object is empty.
        if (dynamo === undefined) {
            throw new Error(`Empty object is not allowed`);
        }
        // Validation check.
        // Is it registered in the metadata?
        const holder = new TClass();
        const entityDescriptor = metadata_1.default.getEntityDescriptorByHolder(holder);
        // Gets all field descriptor to create the Object.
        const propertyDescriptors = [];
        if (entityDescriptor.hash)
            propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.range)
            propertyDescriptors.push(entityDescriptor.range);
        if (entityDescriptor.attrs)
            propertyDescriptors.push(...entityDescriptor.attrs.values());
        // Then deformation and merge all fields.
        for (const propertyDescriptor of propertyDescriptors) {
            const sourceProperty = this.deformationProperty(dynamo, propertyDescriptor);
            Object.assign(holder, sourceProperty);
        }
        return holder;
    }
}
const tynamoFormation = new TynamoFormation();
exports.default = tynamoFormation;
//# sourceMappingURL=tynamo.js.map