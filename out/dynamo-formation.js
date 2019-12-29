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
            const dynamoPropertyName = target.dynamoPropertyName;
            const objectPropertyName = target.objectPropertyName;
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
            const dynamoField = dynamoDatatype == type_1.Datatype.INJECT
                ? dynamoPrimitive
                : {
                    [dynamoPropertyName]: {
                        [dynamoDatatype]: dynamoPrimitive
                    }
                };
            let realPropertyName = "";
            for (const key in dynamoField) {
                realPropertyName = key;
            }
            if (dynamoItem[realPropertyName] != undefined) {
                throw new Error(`Duplicate name while doing INJECT. [${object.constructor.name}.${realPropertyName}]`);
            }
            Object.assign(dynamoItem, dynamoField);
        }
        return dynamoItem;
    }
    // Convert to object.
    //
    deformation(dynamo, classObject, context) {
        // Primitive check.
        if (context && context.dynamoDatatype != type_1.Datatype.INJECT) {
            const value = dynamo[context.dynamoPropertyName][context.dynamoDatatype];
            return utils_1.convertToJsPrimitive(value, context.dynamoDatatype);
        }
        if (dynamo.S)
            return utils_1.convertToJsPrimitive(dynamo.S, type_1.Datatype.S);
        if (dynamo.N)
            return utils_1.convertToJsPrimitive(dynamo.N, type_1.Datatype.N);
        if (dynamo.B)
            return utils_1.convertToJsPrimitive(dynamo.B, type_1.Datatype.B);
        if (dynamo.SS)
            return utils_1.convertToJsPrimitive(dynamo.SS, type_1.Datatype.SS);
        if (dynamo.NS)
            return utils_1.convertToJsPrimitive(dynamo.NS, type_1.Datatype.NS);
        if (dynamo.BS)
            return utils_1.convertToJsPrimitive(dynamo.BS, type_1.Datatype.BS);
        if (dynamo.M)
            return utils_1.convertToJsPrimitive(dynamo.M, type_1.Datatype.M);
        if (dynamo.L)
            return utils_1.convertToJsPrimitive(dynamo.L, type_1.Datatype.L);
        if (dynamo.NULL)
            return utils_1.convertToJsPrimitive(dynamo.NULL, type_1.Datatype.NULL);
        if (dynamo.BOOL)
            return utils_1.convertToJsPrimitive(dynamo.BOOL, type_1.Datatype.BOOL);
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
            const dynamoPropertyName = target.dynamoPropertyName;
            const objectPropertyName = target.objectPropertyName;
            const datatypeArg = {
                source: holder,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = utils_1.fetchFromChunkOrValue(target.datatype, datatypeArg);
            const deserializerArg = {
                object: classObject,
                dynamo: dynamo,
                dynamoDatatype: dynamoDatatype,
                dynamoPropertyName: dynamoPropertyName,
                sourcePropertyName: objectPropertyName
            };
            const nextClassObject = Reflect.getMetadata("design:type", holder, objectPropertyName);
            // merge.
            if (target.serializer !== utils_1.defaultSerializer) {
                const deserialized = utils_1.fetchFromChunkOrValue(target.deserializer, deserializerArg);
                Object.assign(holder, deserialized);
            }
            else {
                const injectedClass = this.deformation(dynamo, nextClassObject, deserializerArg);
                const objectField = {
                    [objectPropertyName]: injectedClass
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