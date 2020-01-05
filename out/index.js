"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dynamo_property_1 = require("./decorator/dynamo-property");
exports.DynamoProperty = dynamo_property_1.DynamoProperty;
const dynamo_entity_1 = require("./decorator/dynamo-entity");
exports.DynamoEntity = dynamo_entity_1.DynamoEntity;
const tynamo_1 = __importDefault(require("./core/tynamo"));
exports.Mapper = tynamo_1.default;
const metadata_1 = __importDefault(require("./core/metadata"));
exports.MetaData = metadata_1.default;
const type_1 = require("./type");
exports.PropertyDecoratorArgs = type_1.PropertyDecoratorArgs;
exports.DataType = type_1.DataType;
exports.DataTypeResolverArg = type_1.DataTypeResolverArg;
exports.KeyType = type_1.KeyType;
exports.FormationMask = type_1.FormationMask;
exports.SerializerArg = type_1.SerializerArg;
exports.DeserializerArg = type_1.DeserializerArg;
exports.PropertyDescriptor = type_1.PropertyDescriptor;
//# sourceMappingURL=index.js.map