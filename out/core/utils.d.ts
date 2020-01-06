import { ChunkOrValue, Serializer, Deserializer } from "./type";
/**
 * Default serializer.
 */
export declare const defaultSerializer: Serializer<any>;
/**
 * Default deserializer.
 */
export declare const defaultDeserializer: Deserializer<any>;
/**
 * Get the value from chunk or value.
 *
 * @param cov Chunk or Value.
 * @param arg Argument using in chunk.
 */
export declare function fetchFromChunkOrValue<TSource>(cov: ChunkOrValue<TSource, any>, arg: any): TSource;
//# sourceMappingURL=utils.d.ts.map