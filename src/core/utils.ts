import { ChunkOrValue, Serializer, SerializerArg, Deserializer, DeserializerArg, DataType, Item, Chunk } from "../type";
import { TableName } from "aws-sdk/clients/dynamodb";

/**
 * Default serializer.
 */
export const defaultSerializer: Serializer<any> = (arg: SerializerArg<any>) => {
    const serialized = arg.source[arg.propertyDescriptor.sourcePropertyName];
    return serialized;
};

/**
 * Default deserializer.
 */
export const defaultDeserializer: Deserializer<any> = (arg: DeserializerArg): any => {
    return arg.dynamo[arg.propertyDescriptor.dynamoPropertyName];
};

/**
 * Default tableNameResolver.
 */
export function defaultTableNameResolver<TSource>(source: TSource): TableName {
    return (source as any).constructor.name;
}

/**
 * Get the value from chunk or value.
 *
 * @param cov Chunk or Value.
 * @param arg Argument using in chunk.
 */
export function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any): TObject {
    if (cov == undefined) throw new Error("not allow empty.");

    const shadow = cov as any;
    if (shadow.constructor == Function) {
        return shadow.call(null, arg);
    } else {
        return shadow;
    }
}
