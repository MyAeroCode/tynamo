"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Metadata {
    constructor() {
        this.global = {};
    }
    // Examine for conflicting fields.
    // This is the case when the type overlaps, or the name overlaps.
    //
    checkConflict(fieldDescriptor) {
        var _a, _b, _c, _d, _e, _f, _g;
        // Validation check.
        // Is it registered in the metadata?
        const classKey = fieldDescriptor.class.constructor.toString();
        const table = this.global[classKey];
        if (table == undefined)
            throw new Error(`Unregistered entity [${fieldDescriptor.class.constructor.name}]`);
        //  Examine if:
        //      1. Duplicate name of field.
        //      2. Duplicate type of field
        const thisFieldName = utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoPropertyName, null);
        const thisFieldTypeName = utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoFieldtype, null);
        const attrs = table.attrs;
        if ((_a = table.hash) === null || _a === void 0 ? void 0 : _a.dynamoPropertyName) {
            const hashFieldName = utils_1.fetchFromChunkOrValue((_c = (_b = table) === null || _b === void 0 ? void 0 : _b.hash) === null || _c === void 0 ? void 0 : _c.dynamoPropertyName, null);
            if (thisFieldTypeName == "Hash" && hashFieldName) {
                throw new Error(`Duplicate hashKey, [${hashFieldName}] and [${thisFieldName}]`);
            }
            if (hashFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }
        if ((_d = table.range) === null || _d === void 0 ? void 0 : _d.dynamoPropertyName) {
            const rangeFieldName = utils_1.fetchFromChunkOrValue((_f = (_e = table) === null || _e === void 0 ? void 0 : _e.range) === null || _f === void 0 ? void 0 : _f.dynamoPropertyName, null);
            if (thisFieldTypeName == "Range" && rangeFieldName) {
                throw new Error(`Duplicate rangeKey, [${rangeFieldName}] and [${thisFieldName}]`);
            }
            if (rangeFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }
        if ((_g = attrs) === null || _g === void 0 ? void 0 : _g.has(thisFieldName)) {
            throw new Error(`Duplicate attrName, [${thisFieldName}]`);
        }
    }
    // Insert one FieldDescriptor.
    // It can be merged if it does not conflict.
    add(fieldDescriptor) {
        // If there is no table, create one.
        const classKey = fieldDescriptor.class.constructor.toString();
        let table = this.global[classKey];
        if (table == undefined) {
            table = this.global[classKey] = {
                attrs: new Map(),
                hash: undefined,
                range: undefined
            };
        }
        // Examine validity and conflict.
        // then insert them in the correct place.
        this.checkConflict(fieldDescriptor);
        let thisFieldType = utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoFieldtype, undefined);
        if (thisFieldType == "Hash")
            table.hash = fieldDescriptor;
        if (thisFieldType == "Range")
            table.range = fieldDescriptor;
        if (thisFieldType == "Attr") {
            table.attrs.set(utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoPropertyName, undefined), fieldDescriptor);
        }
    }
    // Gets the TableDescriptor associated with a given data object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    getOf(object) {
        return this.global[object.constructor.toString()];
    }
}
const metadata = new Metadata();
exports.default = metadata;
//# sourceMappingURL=metadata.js.map