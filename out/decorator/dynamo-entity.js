"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_1 = __importDefault(require("../core/metadata"));
/**
 * Class Decorator :
 *      Add this class to metadata.
 */
function DynamoEntity(particialTableInfo) {
    return (TClass) => {
        metadata_1.default.registEntity(TClass, particialTableInfo);
    };
}
exports.DynamoEntity = DynamoEntity;
//# sourceMappingURL=dynamo-entity.js.map