"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_1 = __importDefault(require("../core/metadata"));
// Class Member Decorator:
//      Add this property to metadata.
//
function DynamoProperty(args) {
    return function createDynamoPropertyDecorator(TClassObject, sourcePropertyName) {
        metadata_1.default.registProperty(TClassObject.constructor, sourcePropertyName.toString(), args);
    };
}
exports.DynamoProperty = DynamoProperty;
//# sourceMappingURL=dynamo-property.js.map