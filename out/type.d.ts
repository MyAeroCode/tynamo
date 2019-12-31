import { AttributeMap, AttributeValue } from "aws-sdk/clients/dynamodb";
export declare type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export declare type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;
export declare enum DataType {
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
    __SCALAR__ = "__SCALAR__"
}
export declare enum PropertyType {
    hash = "HASH",
    range = "RANGE",
    attr = "ATTR"
}
export declare type Item = AttributeMap;
export declare type PropertyValue = AttributeValue;
export declare class DataTypeResolverArg<TSource> {
    source: TSource;
    sourcePropertyName: string;
}
export declare class SerializerArg<TSource> {
    source: TSource;
    propertyDescriptor: PropertyDescriptor<TSource>;
}
export declare class DeserializerArg {
    dynamo: Item;
    propertyDescriptor: PropertyDescriptor<any>;
}
export declare class PropertyDecoratorArgs<TSource> {
    dataType?: DataType;
    nullable?: boolean;
    propertyName?: string;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}
export declare class PropertyDescriptor<TSource> {
    TClassName: string;
    nullable: boolean;
    dataType: DataType;
    serializer: Serializer<TSource>;
    deserializer: Deserializer<TSource>;
    dynamoPropertyType: PropertyType;
    sourcePropertyName: string;
    dynamoPropertyName: string;
}
export declare type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export declare type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;
export declare class EntityDescriptor<TSource> {
    TClass?: any;
    hash?: PropertyDescriptor<TSource>;
    range?: PropertyDescriptor<TSource>;
    attrs?: Map<string, PropertyDescriptor<TSource>>;
}
export declare enum FormationMask {
    HashKey = 1,
    RangeKey = 2,
    Body = 4,
    KeyOnly = 3,
    Full = 7
}
//# sourceMappingURL=type.d.ts.map