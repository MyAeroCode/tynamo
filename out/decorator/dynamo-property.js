"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("../type");
const utils_1 = require("../core/utils");
const metadata_1 = __importDefault(require("../core/metadata"));
// Class Member Decorator:
//      Add this property to metadata.
//
function DynamoProperty(propertyType, args) {
    return function createDynamoPropertyDecorator(TClassObject, sourcePropertyName) {
        // If not define propertyDecoratorArgs, create default.
        if (!args)
            args = {};
        if (!args.dataType) {
            const sourceDataType = Reflect.getMetadata("design:type", TClassObject, sourcePropertyName);
            switch (sourceDataType) {
                case String:
                    args.dataType = type_1.DataType.S;
                    break;
                case Number:
                    args.dataType = type_1.DataType.N;
                    break;
                case Boolean:
                    args.dataType = type_1.DataType.BOOL;
                    break;
                default:
                    throw new Error(`Please specify DynamoPropertyDataType. -> [${TClassObject.constructor.name}.${sourcePropertyName.toString()}]`);
            }
        }
        if (!args.nullable)
            args.nullable = false;
        if (!args.serializer)
            args.serializer = utils_1.defaultSerializer;
        if (!args.deserializer)
            args.deserializer = utils_1.defaultDeserializer;
        if (!args.propertyName)
            args.propertyName = sourcePropertyName.toString();
        // Create property descriptor.
        const propertyDescriptor = {
            TClassName: TClassObject.constructor.name,
            dynamoPropertyType: propertyType,
            dataType: args.dataType,
            nullable: args.nullable,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            sourcePropertyName: sourcePropertyName.toString()
        };
        // Add to metadata.
        metadata_1.default.registProperty(propertyDescriptor);
    };
}
exports.DynamoProperty = DynamoProperty;
//# sourceMappingURL=dynamo-property.js.map