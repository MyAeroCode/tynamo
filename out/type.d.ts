import { AttributeMap } from "aws-sdk/clients/dynamodb";
export declare type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export declare type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;
export declare enum Datatype {
    S = "S",
    N = "N",
    B = "B",
    SS = "SS",
    NS = "NS",
    BS = "BS",
    M = "M",
    L = "L",
    NULL = "NULL",
    BOOL = "BOOL",
    NESTED = "NESTED"
}
export declare enum Fieldtype {
    hash = "HASH",
    range = "RANGE",
    attr = "ATTR"
}
export declare type Item = AttributeMap;
export interface DatatypeArg<TSource> {
    source: TSource;
    sourcePropertyName: string;
}
export interface SerializerArg<TSource> {
    source: TSource;
    sourcePropertyName: string;
}
export interface DeserializerArg {
    dynamo: Item;
    dynamoDatatype: Datatype;
    dynamoPropertyName: string;
    sourcePropertyName: string;
}
export interface FieldDecoratorArgs<TSource> {
    datatype?: DatatypeOrChunk<TSource>;
    propertyName?: string;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}
export interface FieldDescriptor<TSource> {
    class: Object;
    serializer: Serializer<TSource>;
    deserializer: Deserializer<TSource>;
    datatype: DatatypeOrChunk<TSource>;
    fieldtype: Fieldtype;
    objectPropertyName: string;
    dynamoPropertyName: string;
}
export declare type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export declare type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;
export declare type DatatypeOrChunk<TSource> = ChunkOrValue<Datatype, DatatypeArg<TSource>>;
export declare type TableDescriptor<TSource> = {
    hash?: FieldDescriptor<TSource>;
    range?: FieldDescriptor<TSource>;
    attrs?: Map<string, FieldDescriptor<TSource>>;
};
export declare type GlobalDescriptor = {
    [classKey: string]: TableDescriptor<any> | undefined;
};
export declare enum FormationMask {
    HashKey = 1,
    RangeKey = 2,
    Body = 4,
    KeyOnly = 3,
    Full = 7
}
//# sourceMappingURL=type.d.ts.map