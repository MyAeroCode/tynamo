"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
exports.DynamoProperty = decorator_1.DynamoProperty;
exports.DynamoEntity = decorator_1.DynamoEntity;
const tynamo_1 = __importDefault(require("./tynamo"));
exports.TynamoFormation = tynamo_1.default;
const metadata_1 = __importDefault(require("./metadata"));
exports.MetaData = metadata_1.default;
const type_1 = require("./type");
exports.PropertyDecoratorArgs = type_1.PropertyDecoratorArgs;
exports.DataType = type_1.DataType;
exports.DataTypeResolverArg = type_1.DataTypeResolverArg;
exports.PropertyType = type_1.PropertyType;
exports.FormationMask = type_1.FormationMask;
exports.SerializerArg = type_1.SerializerArg;
exports.DeserializerArg = type_1.DeserializerArg;
exports.PropertyDescriptor = type_1.PropertyDescriptor;
//# sourceMappingURL=index.js.map