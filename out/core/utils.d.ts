import { ChunkOrValue, Serializer, Deserializer } from "../type";
import { TableName } from "aws-sdk/clients/dynamodb";
/**
 * Default serializer.
 */
export declare const defaultSerializer: Serializer<any>;
/**
 * Default deserializer.
 */
export declare const defaultDeserializer: Deserializer<any>;
/**
 * Default tableNameResolver.
 */
export declare function defaultTableNameResolver<TSource>(source: TSource): TableName;
/**
 * Get the value from chunk or value.
 *
 * @param cov Chunk or Value.
 * @param arg Argument using in chunk.
 */
export declare function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any): TObject;
//# sourceMappingURL=utils.d.ts.map