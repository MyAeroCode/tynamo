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
    formation(object, formationType = type_1.FormationType.Full) {
        // Validation check.
        // Is it registered in the metadata?
        const table = metadata_1.default.getOf(object);
        if (!table)
            throw new Error(`Unregistered entity [${object.constructor.name}]`);
        // Gets all field descriptor to create the DynamoItem.
        // Then serialize and merge all fields.
        const fields = [];
        if (formationType & type_1.FormationType.HashKey && table.hash)
            fields.push(table.hash);
        if (formationType & type_1.FormationType.RangeKey && table.range)
            fields.push(table.range);
        if (formationType & type_1.FormationType.Body)
            fields.push(...table.attrs.values());
        const dynamoItem = {};
        for (const target of fields) {
            // fetch from chunk or value.
            let dynamoDatatypeName = utils_1.fetchFromChunkOrValue(target.dynamoDatatypeName, undefined);
            let dynamoPropertyName = utils_1.fetchFromChunkOrValue(target.dynamoPropertyName, undefined);
            let objectPropertyName = utils_1.fetchFromChunkOrValue(target.objectPropertyName, undefined);
            let serialized = utils_1.fetchFromChunkOrValue(target.serializer, {
                object: object,
                objectPropertyName: objectPropertyName
            });
            // merge.
            let item = {
                [dynamoPropertyName]: {
                    [dynamoDatatypeName]: serialized
                }
            };
            Object.assign(dynamoItem, item);
        }
        return dynamoItem;
    }
    // Convert to object.
    //
    deformation(dynamo, classObject) {
        // Validation check.
        // Is it registered in the metadata?
        let holder = new classObject();
        const table = metadata_1.default.getOf(holder);
        if (table == undefined)
            throw new Error(`Unregistered entity [${holder.constructor.name}]`);
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
            let dynamoPropertyName = utils_1.fetchFromChunkOrValue(target.dynamoPropertyName, undefined);
            let dynamoDatatypeName = utils_1.fetchFromChunkOrValue(target.dynamoDatatypeName, undefined);
            let objectPropertyName = utils_1.fetchFromChunkOrValue(target.objectPropertyName, undefined);
            let deserialized = utils_1.fetchFromChunkOrValue(target.deserializer, {
                dynamo: dynamo,
                dynamoPropertyName: dynamoPropertyName,
                dynamoDatatypeName: dynamoDatatypeName,
                objectPropertyName: objectPropertyName
            });
            // merge.
            Object.assign(holder, deserialized);
        }
        return holder;
    }
}
const dynamoFormation = new DynamoFormation();
exports.default = dynamoFormation;
//# sourceMappingURL=dynamo-formation.js.map