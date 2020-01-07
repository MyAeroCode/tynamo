import { SerializerArg, DeserializerArg, Chunk } from "./type";
/**
 * Default serializer.
 */
export declare function defaultSerializer<TSource, TParam>(arg: SerializerArg<TSource>): TParam;
/**
 * Default deserializer.
 */
export declare function defaultDeserializer<TSource>(arg: DeserializerArg<TSource>): Partial<TSource>;
/**
 * Get the value from chunk or value.
 *
 * @param chunk Chunk or Value.
 * @param arg Argument using in chunk.
 */
export declare function fetchFromChunk<TSource, TParam>(chunk: Chunk<TSource, TParam>, arg: TParam): TSource;
//# sourceMappingURL=utils.d.ts.map