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
require("reflect-metadata");
// Core Feature.
const tynamo_1 = __importDefault(require("./core/tynamo"));
exports.Tynamo = tynamo_1.default;
const mapper_1 = __importDefault(require("./core/mapper"));
exports.Mapper = mapper_1.default;
const metadata_1 = __importDefault(require("./core/metadata"));
exports.MetaData = metadata_1.default;
const expressionParser_1 = __importDefault(require("./core/expressionParser"));
exports.ExpressionParser = expressionParser_1.default;
const Type = __importStar(require("./core/type"));
exports.Type = Type;
// Decorator.
const dynamo_property_1 = require("./decorator/dynamo-property");
exports.DynamoProperty = dynamo_property_1.DynamoProperty;
const dynamo_entity_1 = require("./decorator/dynamo-entity");
exports.DynamoEntity = dynamo_entity_1.DynamoEntity;
//# sourceMappingURL=index.js.map