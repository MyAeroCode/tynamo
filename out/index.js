"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorator_1 = require("./decorator");
exports.DynamoField = decorator_1.DynamoField;
const dynamo_formation_1 = __importDefault(require("./dynamo-formation"));
exports.DynamoFormation = dynamo_formation_1.default;
const metadata_1 = __importDefault(require("./metadata"));
exports.Metadata = metadata_1.default;
const Type = __importStar(require("./type"));
exports.Type = Type;
//# sourceMappingURL=index.js.map