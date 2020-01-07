import { ChunkOrValue, Serializer, SerializerArg, Deserializer, DeserializerArg, Chunk } from "./type";

/**
 * Default serializer.
 */
export function defaultSerializer<TSource, TParam>(arg: SerializerArg<TSource>): TParam {
    return (arg.source as any)[arg.propertyDescriptor.sourcePropertyName];
}

/**
 * Default deserializer.
 */
export function defaultDeserializer<TSource>(arg: DeserializerArg<TSource>): Partial<TSource> {
    return arg.dynamo[arg.propertyDescriptor.dynamoPropertyName] as any;
}

/**
 * Get the value from chunk or value.
 *
 * @param chunk Chunk or Value.
 * @param arg Argument using in chunk.
 */
export function fetchFromChunk<TSource, TParam>(chunk: Chunk<TSource, TParam>, arg: TParam): TSource {
    return chunk.call(null, arg);
}
