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
class DynamoFormation {
    // Converts to DynamoItem.
    //
    formation(object, formationType = type_1.FormationMask.Full) {
        // Primitive check.
        const classType = object.constructor;
        if (classType === String) {
            return {
                S: object
            };
        }
        if (classType === Number) {
            return {
                N: object.toString()
            };
        }
        if (classType === Boolean) {
            return {
                BOOL: object
            };
        }
        // Validation check.
        // Is it registered in the metadata?
        const table = metadata_1.default.getOf(object);
        // Gets all field descriptor to create the DynamoItem.
        // Then serialize and merge all fields.
        const fields = [];
        if (formationType & type_1.FormationMask.HashKey && table.hash)
            fields.push(table.hash);
        if (formationType & type_1.FormationMask.RangeKey && table.range)
            fields.push(table.range);
        if (formationType & type_1.FormationMask.Body)
            fields.push(...table.attrs.values());
        const dynamoItem = {};
        for (const target of fields) {
            // fetch from chunk or value.
            const dynamoPropertyName = utils_1.fetchFromChunkOrValue(target.dynamoPropertyName, undefined);
            const objectPropertyName = utils_1.fetchFromChunkOrValue(target.objectPropertyName, undefined);
            const datatypeArg = {
                source: object,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = utils_1.fetchFromChunkOrValue(target.datatype, datatypeArg);
            const serializerArg = {
                source: object,
                sourcePropertyName: objectPropertyName
            };
            const serialized = utils_1.fetchFromChunkOrValue(target.serializer, serializerArg);
            const dynamoPrimitive = utils_1.convertToDynamoPrimitive(serialized, dynamoDatatype);
            // merge.
            const dynamoField = dynamoDatatype == type_1.Datatype.NESTED
                ? {
                    [dynamoPropertyName]: dynamoPrimitive
                }
                : {
                    [dynamoPropertyName]: {
                        [dynamoDatatype]: dynamoPrimitive
                    }
                };
            Object.assign(dynamoItem, dynamoField);
        }
        return dynamoItem;
    }
    // Convert to object.
    //
    deformation(dynamo, classObject) {
        // Primitive check.
        if (dynamo.N)
            return Number.parseFloat(dynamo.N); // it must number.
        if (dynamo.S)
            return dynamo.S; // it must string.
        if (dynamo.BOOL)
            return dynamo.BOOL; // it must boolean.
        // Validation check.
        // Is it registered in the metadata?
        const holder = new classObject();
        const table = metadata_1.default.getOf(holder);
        // Gets all field descriptor to create the Object.
        // Then deserialize and merge all fields.
        const targets = [];
        if (table.hash)
            targets.push(table.hash);
        if (table.range)
            targets.push(table.range);
        if (table.attrs)
            targets.push(...table.attrs.values());
        for (const target of targets) {
            // fetch from chunk or value.
            const dynamoPropertyName = utils_1.fetchFromChunkOrValue(target.dynamoPropertyName, undefined);
            const objectPropertyName = utils_1.fetchFromChunkOrValue(target.objectPropertyName, undefined);
            const datatypeArg = {
                source: holder,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = utils_1.fetchFromChunkOrValue(target.datatype, datatypeArg);
            const deserializerArg = {
                dynamo: dynamo,
                dynamoDatatype: dynamoDatatype,
                dynamoPropertyName: dynamoPropertyName,
                sourcePropertyName: objectPropertyName
            };
            const deserialized = utils_1.fetchFromChunkOrValue(target.deserializer, deserializerArg);
            const nextClassObject = Reflect.getMetadata("design:type", holder, objectPropertyName);
            const jsPrimitive = utils_1.convertToJsPrimitive(deserialized, dynamoDatatype, nextClassObject);
            // merge.
            if (target.serializer !== utils_1.defaultSerializer) {
                Object.assign(holder, deserialized);
            }
            else {
                const jsPrimitive = utils_1.convertToJsPrimitive(deserialized, dynamoDatatype, nextClassObject);
                const objectField = {
                    [objectPropertyName]: jsPrimitive
                };
                Object.assign(holder, objectField);
            }
        }
        return holder;
    }
}
const dynamoFormation = new DynamoFormation();
exports.default = dynamoFormation;
//# sourceMappingURL=dynamo-formation.js.map