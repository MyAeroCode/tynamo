"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const metadata_1 = __importDefault(require("./metadata"));
// Class Member Decorator:
//      Add this field to DynamoItem.
//
function DynamoField(dynamoFieldType, args) {
    return function createDynamoFieldDecorator(target, objectPropertyName) {
        if (!args)
            args = {};
        if (!args.datatype)
            args.datatype = utils_1.defaultDatatype;
        if (!args.serializer)
            args.serializer = utils_1.defaultSerializer;
        if (!args.deserializer)
            args.deserializer = utils_1.defaultDeserializer;
        if (!args.propertyName)
            args.propertyName = objectPropertyName.toString();
        const descriptor = {
            class: target,
            fieldtype: dynamoFieldType,
            datatype: args.datatype,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            objectPropertyName: objectPropertyName.toString()
        };
        metadata_1.default.add(descriptor);
    };
}
exports.DynamoField = DynamoField;
//# sourceMappingURL=decorator.js.map