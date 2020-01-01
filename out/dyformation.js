"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const metadata_1 = __importDefault(require("./metadata"));
const utils_1 = require("./utils");
// Performs the interconversion between DynamoItem and the object.
//
class DynamoDBFormation {
    // Convert sourceScalar to dynamoScalar.
    //
    formationScalar(value) {
        if (value === undefined || value === null || value === "")
            throw new Error(`'${value}' is not allowed.`);
        if (value.constructor === Number)
            return value.toString();
        if (value.constructor === String)
            return value;
        if (value.constructor === Boolean)
            return value;
        throw new Error(`'${value}' is not scalar.`);
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
                [dynamoPropertyName]: {
                    [realDataType]: value
                }
            };
        }
        switch (realDataType) {
            case type_1.DataType.S:
            case type_1.DataType.N:
            case type_1.DataType.B:
            case type_1.DataType.BOOL:
                return resolve(this.formationScalar(source));
            case type_1.DataType.SS:
            case type_1.DataType.NS:
            case type_1.DataType.BS:
                return resolve(source.map((v) => this.formationScalar(v)));
            case type_1.DataType.L:
                return resolve(source.map((v) => {
                    try {
                        return this.formation(v);
                    }
                    catch (e) {
                        throw new Error(`DataType.L should not contain scalar values.`);
                    }
                }));
            case type_1.DataType.M:
                return resolve(this.formation(source));
            case type_1.DataType.NULL:
                return resolve(true);
            default:
                throw new Error(`Can not detect DataType.`);
        }
    }
    // Convert sourceObject to dynamoItem.
    //
    formation(source, formationType = type_1.FormationMask.Full) {
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowd.`);
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
    // Convert dynamoProperty to sourceProperty.
    //
    deformationProperty(parent, propertyDescriptor) {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data) {
            return {
                [sourcePropertyName]: data
            };
        }
        // deserializer
        const property = utils_1.fetchFromChunkOrValue(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });
        if (property.S)
            return resolve(String(property.S));
        if (property.N)
            return resolve(Number(property.N));
        if (property.B)
            return resolve(String(property.B));
        if (property.SS)
            return resolve(property.SS);
        if (property.NS)
            return resolve(property.NS.map((nstr) => Number(nstr)));
        if (property.BS)
            return resolve(property.BS);
        if (property.L)
            return resolve(property.L.map((val) => this.deformation(val)));
        if (property.M)
            return resolve(this.deformation(property.M));
        if (property.BOOL)
            return resolve(property.BOOL);
        if (property.NULL)
            return resolve(undefined);
        return property;
    }
    // Convert dynamoItem to sourceObject.
    //
    deformation(dynamo, TClass = metadata_1.default.getTClassByDynamo(dynamo)) {
        // Validation check.
        // Is it registered in the metadata?
        const holder = new TClass();
        const entityDescriptor = metadata_1.default.getEntityDescriptorByHolder(holder);
        // Gets all field descriptor to create the Object.
        // Then deserialize and merge all fields.
        const propertyDescriptors = [];
        if (entityDescriptor.hash)
            propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.range)
            propertyDescriptors.push(entityDescriptor.range);
        if (entityDescriptor.attrs)
            propertyDescriptors.push(...entityDescriptor.attrs.values());
        for (const propertyDescriptor of propertyDescriptors) {
            const sourceProperty = this.deformationProperty(dynamo, propertyDescriptor);
            Object.assign(holder, sourceProperty);
        }
        return holder;
    }
}
const dynamoFormation = new DynamoDBFormation();
exports.default = dynamoFormation;
//# sourceMappingURL=dyformation.js.map