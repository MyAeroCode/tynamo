"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default serializer.
 */
exports.defaultSerializer = (arg) => {
    const serialized = arg.source[arg.propertyDescriptor.sourcePropertyName];
    return serialized;
};
/**
 * Default deserializer.
 */
exports.defaultDeserializer = (arg) => {
    return arg.dynamo[arg.propertyDescriptor.dynamoPropertyName];
};
/**
 * Get the value from chunk or value.
 *
 * @param cov Chunk or Value.
 * @param arg Argument using in chunk.
 */
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