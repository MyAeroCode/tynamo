import { AttributeMap } from "aws-sdk/clients/dynamodb";
export declare type Maybe<T> = T | undefined;
export declare type Chunk<TReturn, TParam> = () => (param: TParam) => TReturn;
export declare type ChunkOrValue<TObject, TParam> = TObject | Chunk<TObject, TParam>;
export declare type DataType = "S" | "N" | "B" | "SS" | "NS" | "BS" | "M" | "L" | "NULL" | "BOOL";
export declare type Item = AttributeMap;
export declare type FieldType = "Hash" | "Range" | "Attr";
export interface SerializerArg<TObject> {
    object: TObject;
    objectPropertyName: string;
}
export interface DeserializerArg {
    dynamo: Item;
    dynamoPropertyName: string;
    dynamoDatatypeName: DataType;
    objectPropertyName: string;
}
export interface FieldDecoratorArgs<TObject> {
    dynamoPropertyName?: ChunkOrValue<any, string>;
    dynamoDatatypeName?: ChunkOrValue<any, DataType>;
    serialize?: SerializerOrChunk<TObject>;
    deserialize?: DeserializerOrChunk<TObject>;
}
export interface FieldDescriptor<TObject> {
    class: Object;
    serializer: SerializerOrChunk<TObject>;
    deserializer: DeserializerOrChunk<TObject>;
    dynamoFieldtype: FieldtypeOrChunk;
    dynamoDatatypeName: DatatypeOrChunk;
    objectPropertyName: PropertyNameOrChunk;
    dynamoPropertyName: PropertyNameOrChunk;
}
export declare type SerializerOrChunk<TObject> = ChunkOrValue<any, SerializerArg<TObject>>;
export declare type DeserializerOrChunk<TObject> = ChunkOrValue<TObject, DeserializerArg>;
export declare type DatatypeOrChunk = ChunkOrValue<DataType, undefined>;
export declare type FieldtypeOrChunk = ChunkOrValue<FieldType, undefined>;
export declare type PropertyNameOrChunk = ChunkOrValue<string, undefined>;
export declare type TableDescriptor<TObject> = {
    hash: Maybe<FieldDescriptor<TObject>>;
    range: Maybe<FieldDescriptor<TObject>>;
    attrs: Maybe<Map<string, FieldDescriptor<TObject>>>;
};
export declare type GlobalDescriptor = {
    [classKey: string]: Maybe<TableDescriptor<any>>;
};
export declare enum FormationType {
    HashKey = 1,
    RangeKey = 2,
    Body = 4,
    KeyOnly = 3,
    Full = 7
}
//# sourceMappingURL=type.d.ts.map