"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const utils_1 = require("./utils");
class Metadata {
    constructor() {
        this.global = {};
        this.classObjectCache = new Map();
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
        const thisFieldtype = utils_1.fetchFromChunkOrValue(fieldDescriptor.fieldtype, null);
        const attrs = table.attrs;
        if ((_a = table.hash) === null || _a === void 0 ? void 0 : _a.dynamoPropertyName) {
            const hashFieldName = utils_1.fetchFromChunkOrValue((_c = (_b = table) === null || _b === void 0 ? void 0 : _b.hash) === null || _c === void 0 ? void 0 : _c.dynamoPropertyName, null);
            if (thisFieldtype == type_1.Fieldtype.hash && hashFieldName) {
                throw new Error(`Duplicate hashKey, [${hashFieldName}] and [${thisFieldName}]`);
            }
            if (hashFieldName == thisFieldName) {
                throw new Error(`Duplicate attrName, [${thisFieldName}]`);
            }
        }
        if ((_d = table.range) === null || _d === void 0 ? void 0 : _d.dynamoPropertyName) {
            const rangeFieldName = utils_1.fetchFromChunkOrValue((_f = (_e = table) === null || _e === void 0 ? void 0 : _e.range) === null || _f === void 0 ? void 0 : _f.dynamoPropertyName, null);
            if (thisFieldtype == type_1.Fieldtype.range && rangeFieldName) {
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
    //
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
        let thisFieldType = utils_1.fetchFromChunkOrValue(fieldDescriptor.fieldtype, undefined);
        if (thisFieldType == type_1.Fieldtype.hash)
            table.hash = fieldDescriptor;
        if (thisFieldType == type_1.Fieldtype.range)
            table.range = fieldDescriptor;
        if (thisFieldType == type_1.Fieldtype.attr) {
            table.attrs.set(utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoPropertyName, undefined), fieldDescriptor);
        }
        // Convert constructor to constructable object.
        // Then caching it.
        if (!this.classObjectCache.has(classKey)) {
            const classObject = eval(`${classKey}; ${fieldDescriptor.class.constructor.name}`);
            this.classObjectCache.set(classKey, classObject);
        }
    }
    // Gets the TableDescriptor associated with a given data object.
    // Instead of the class itself, pass over the holder.
    // e.g) getOf(new Something());
    //
    getOf(object) {
        const classKey = object.constructor.toString();
        const table = this.global[classKey];
        if (!table) {
            throw new Error(`Unregistered entity [${object.constructor.name}]`);
        }
        if (!table.hash) {
            throw new Error(`No hashKey in [${object.constructor.name}]`);
        }
        return table;
    }
    // Returns a descriptor with the same structure.
    // If there are many such descriptors, an error.
    // For the primitive, return undefined.
    //
    searchClassObjectLike(item) {
        // Primitive check.
        if (item.N)
            return undefined;
        if (item.S)
            return undefined;
        if (item.BOOL)
            return undefined;
        // Find such descriptors.
        let found = [];
        for (let classKey in this.global) {
            let classObject = undefined;
            const tableFieldNames = this.getAllFieldsOf(classKey).map((fieldDescriptor) => {
                if (!classObject)
                    classObject = fieldDescriptor.class;
                return utils_1.fetchFromChunkOrValue(fieldDescriptor.dynamoPropertyName, null);
            });
            const itemFieldNames = [];
            for (let name in item) {
                itemFieldNames.push(name);
            }
            if (tableFieldNames.length !== itemFieldNames.length)
                continue;
            tableFieldNames.sort();
            itemFieldNames.sort();
            let isMatch = true;
            for (let i = 0; i < tableFieldNames.length; i++) {
                if (tableFieldNames[i] !== itemFieldNames[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                found.push(classObject);
            }
        }
        // Check validation.
        if (found.length == 0) {
            throw new Error(`No such table.`);
        }
        else if (found.length >= 2) {
            throw new Error(`Table Structure Conflict. [${found.map((f) => f.constructor.name)}]`);
        }
        console.log("find!", found[0].constructor.name);
        // Return constructable object.
        // It it new-keyword-usable object.
        const classObject = this.classObjectCache.get(found[0].constructor.toString());
        return classObject;
    }
    // Gets the list of all fields in a given table.
    //
    getAllFieldsOf(classKey) {
        const table = this.global[classKey];
        if (table == undefined)
            throw new Error(`Unregistered entity. [${classKey}]`);
        const allFields = [];
        if (table.hash)
            allFields.push(table.hash);
        if (table.range)
            allFields.push(table.range);
        if (table.attrs)
            allFields.push(...table.attrs.values());
        return allFields;
    }
}
const metadata = new Metadata();
exports.default = metadata;
//# sourceMappingURL=metadata.js.map