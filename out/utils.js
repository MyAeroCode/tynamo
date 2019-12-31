"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
// Default serializer.
exports.defaultSerializer = (arg) => {
    const serialized = arg.source[arg.propertyDescriptor.sourcePropertyName];
    return serialized;
};
// Default deserializer.
exports.defaultDeserializer = (arg) => {
    if (arg.propertyDescriptor.dataType === type_1.DataType.__SCALAR__)
        throw new Error();
    return arg.dynamo[arg.propertyDescriptor.dynamoPropertyName];
};
// Get the value from chunk or value.
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