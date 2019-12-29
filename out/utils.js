"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const dynamo_formation_1 = __importDefault(require("./dynamo-formation"));
const metadata_1 = __importDefault(require("./metadata"));
// Get DynamoDataType of primitive type.
// Operate only for String, Number, and Boolean.
//
exports.defaultDatatype = (arg) => {
    const type = Reflect.getMetadata("design:type", arg.source, arg.sourcePropertyName);
    if (type === String)
        return type_1.Datatype.S;
    if (type === Number)
        return type_1.Datatype.N;
    if (type === Boolean)
        return type_1.Datatype.BOOL;
    throw new Error(`Please specify DynamoDataType of [${arg.source.constructor.name}.${arg.sourcePropertyName}]`);
};
// Using the value of the itself.
//
exports.defaultSerialize = (arg) => {
    const serialized = arg.source[arg.sourcePropertyName];
    return serialized;
};
// Using the value of the described.
//
exports.defaultDeserialize = (arg) => {
    return arg.dynamoDatatype == type_1.Datatype.NESTED
        ? arg.dynamo[arg.dynamoPropertyName]
        : arg.dynamo[arg.dynamoPropertyName][arg.dynamoDatatype];
};
// Convert JsPrimitive to DynamoPrimitive.
// Operates after serialization is performed.
//
function convertToDynamoPrimitive(jsPrimitive, datatype) {
    switch (datatype) {
        case type_1.Datatype.S:
        case type_1.Datatype.N:
        case type_1.Datatype.B:
            return jsPrimitive.toString();
        case type_1.Datatype.SS:
        case type_1.Datatype.NS:
        case type_1.Datatype.BS:
            return jsPrimitive.map((v) => v.toString());
        case type_1.Datatype.BOOL:
            return jsPrimitive;
        case type_1.Datatype.NULL:
            return new Error(`No support NULL type.`);
        case type_1.Datatype.M:
            const map = {};
            for (let key in jsPrimitive) {
                const nestedFormation = dynamo_formation_1.default.formation(jsPrimitive[key]);
                const nestedField = {
                    [key]: nestedFormation
                };
                Object.assign(map, nestedField);
            }
            return map;
        case type_1.Datatype.L:
            const list = jsPrimitive.map((elem) => dynamo_formation_1.default.formation(elem));
            return list;
        case type_1.Datatype.NESTED:
            const nestedFormation = dynamo_formation_1.default.formation(jsPrimitive);
            return nestedFormation;
        default:
            throw new Error();
    }
}
exports.convertToDynamoPrimitive = convertToDynamoPrimitive;
// Convert DynamoPrimitive to JsPrimitive.
// Operates after deserialization is performed.
//
function convertToJsPrimitive(dynamoPrimitive, datatypeId, classObject) {
    switch (datatypeId) {
        case type_1.Datatype.S:
        case type_1.Datatype.B: // it must be string.
        case type_1.Datatype.BOOL:
            return dynamoPrimitive;
        case type_1.Datatype.N:
            return Number.parseFloat(dynamoPrimitive);
        case type_1.Datatype.SS:
        case type_1.Datatype.BS:
            return dynamoPrimitive;
        case type_1.Datatype.NS:
            return dynamoPrimitive.map((nstr) => Number.parseFloat(nstr));
        case type_1.Datatype.NULL:
            return new Error(`No support NULL type.`);
        case type_1.Datatype.M:
            let deformation = {};
            for (let key in dynamoPrimitive) {
                const alike = metadata_1.default.searchClassObjectLike(dynamoPrimitive[key]);
                const nestedDeformation = dynamo_formation_1.default.deformation(dynamoPrimitive[key], alike);
                const nestedField = {
                    [key]: nestedDeformation
                };
                Object.assign(deformation, nestedField);
            }
            return deformation;
        case type_1.Datatype.L:
            return dynamoPrimitive.map((elem) => {
                const alike = metadata_1.default.searchClassObjectLike(elem);
                const nestedDeformation = dynamo_formation_1.default.deformation(elem, alike);
                return nestedDeformation;
            });
        case type_1.Datatype.NESTED:
            const nestedDeformation = dynamo_formation_1.default.deformation(dynamoPrimitive, classObject);
            return nestedDeformation;
        default:
            throw new Error();
    }
}
exports.convertToJsPrimitive = convertToJsPrimitive;
// Get the value from Chunk or Value.
//
function fetchFromChunkOrValue(cov, arg) {
    if (cov == undefined)
        throw new Error("not allow empty.");
    const shadow = cov;
    if (shadow.constructor == Function) {
        return shadow.call(null, arg);
    }
    else {
        return shadow;
    }
}
exports.fetchFromChunkOrValue = fetchFromChunkOrValue;
//# sourceMappingURL=utils.js.map