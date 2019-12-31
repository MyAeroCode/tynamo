"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const utils_1 = require("./utils");
const metadata_1 = __importDefault(require("./metadata"));
function DynamoEntity(TClass) {
    metadata_1.default.registEntity(TClass);
}
exports.DynamoEntity = DynamoEntity;
// Class Member Decorator:
//      Add this property to DynamoItem.
//
function DynamoProperty(propertyType, args) {
    return function createDynamoPropertyDecorator(TClassObject, sourcePropertyName) {
        if (!args)
            args = {};
        if (!args.dataType)
            args.dataType = type_1.DataType.__SCALAR__;
        if (!args.nullable)
            args.nullable = false;
        if (!args.serializer)
            args.serializer = utils_1.defaultSerializer;
        if (!args.deserializer)
            args.deserializer = utils_1.defaultDeserializer;
        if (!args.propertyName)
            args.propertyName = sourcePropertyName.toString();
        const descriptor = {
            TClassName: TClassObject.constructor.name,
            dynamoPropertyType: propertyType,
            dataType: args.dataType,
            nullable: args.nullable,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            sourcePropertyName: sourcePropertyName.toString()
        };
        metadata_1.default.registPropertyDescriptor(descriptor);
    };
}
exports.DynamoProperty = DynamoProperty;
//# sourceMappingURL=decorator.js.map