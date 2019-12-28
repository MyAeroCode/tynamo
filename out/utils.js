"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
function defaultDatatype() {
    return function () {
        throw new Error(`Please specify the type explicitly.`);
    };
}
exports.defaultDatatype = defaultDatatype;
// Serialize the values of the same propertyName.
function defaultSerialize() {
    return function (arg) {
        return arg.object[arg.objectPropertyName];
    };
}
exports.defaultSerialize = defaultSerialize;
// Gets the value of the datatype location described.
function defaultDeserialize() {
    return function (arg) {
        return {
            [arg.objectPropertyName]: arg.dynamo[arg.dynamoPropertyName][arg.dynamoDatatypeName]
        };
    };
}
exports.defaultDeserialize = defaultDeserialize;
// Get the value from Chunk or Value.
function fetchFromChunkOrValue(cov, arg, ...args) {
    if (cov == undefined)
        throw new Error("not allow empty.");
    let shadow = cov;
    let fetch;
    if (shadow.constructor == Function) {
        fetch = shadow.call(null, args).call(null, arg);
    }
    else {
        fetch = shadow;
    }
    return fetch;
}
exports.fetchFromChunkOrValue = fetchFromChunkOrValue;
//# sourceMappingURL=utils.js.map