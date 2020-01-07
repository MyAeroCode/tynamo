"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default serializer.
 */
function defaultSerializer(arg) {
    return arg.source[arg.propertyDescriptor.sourcePropertyName];
}
exports.defaultSerializer = defaultSerializer;
/**
 * Default deserializer.
 */
function defaultDeserializer(arg) {
    return arg.dynamo[arg.propertyDescriptor.dynamoPropertyName];
}
exports.defaultDeserializer = defaultDeserializer;
/**
 * Get the value from chunk or value.
 *
 * @param chunk Chunk or Value.
 * @param arg Argument using in chunk.
 */
function fetchFromChunk(chunk, arg) {
    return chunk.call(null, arg);
}
exports.fetchFromChunk = fetchFromChunk;
//# sourceMappingURL=utils.js.map