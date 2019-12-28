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
        var _a, _b, _c, _d;
        let descriptor = {
            class: target,
            dynamoFieldtype: dynamoFieldType,
            dynamoDatatypeName: ((_a = args) === null || _a === void 0 ? void 0 : _a.dynamoDatatypeName) ? args.dynamoDatatypeName : utils_1.defaultDatatype,
            serializer: ((_b = args) === null || _b === void 0 ? void 0 : _b.serialize) ? args.serialize : utils_1.defaultSerialize,
            deserializer: ((_c = args) === null || _c === void 0 ? void 0 : _c.deserialize) ? args.deserialize : utils_1.defaultDeserialize,
            objectPropertyName: objectPropertyName.toString(),
            dynamoPropertyName: ((_d = args) === null || _d === void 0 ? void 0 : _d.dynamoPropertyName) ? args.dynamoPropertyName : objectPropertyName.toString()
        };
        metadata_1.default.add(descriptor);
    };
}
exports.DynamoField = DynamoField;
//# sourceMappingURL=decorator.js.map