"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
exports.DynamoField = decorator_1.DynamoField;
const dynamo_formation_1 = __importDefault(require("./dynamo-formation"));
exports.DynamoFormation = dynamo_formation_1.default;
const metadata_1 = __importDefault(require("./metadata"));
exports.Metadata = metadata_1.default;
const type_1 = require("./type");
exports.Datatype = type_1.Datatype;
exports.Fieldtype = type_1.Fieldtype;
exports.FormationMask = type_1.FormationMask;
//# sourceMappingURL=index.js.map