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
    BOOL = "BOOL"
}
export declare enum KeyType {
    hash = "HASH",
    sort = "RANGE",
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
    keyType: KeyType;
    dataType?: DataType;
    sourceDataType?: any;
    propertyName?: string;
    nullable?: boolean;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}
export declare class PropertyDescriptor<TSource> {
    nullable: boolean;
    serializer: Serializer<TSource>;
    deserializer: Deserializer<TSource>;
    sourceDataType: any;
    dynamoKeyType: KeyType;
    dynamoDataType: DataType;
    sourcePropertyName: string;
    dynamoPropertyName: string;
}
export declare type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export declare type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;
export declare class EntityDescriptor<TSource> {
    TClass: any;
    hash: PropertyDescriptor<TSource>;
    sort?: PropertyDescriptor<TSource>;
    attr: PropertyDescriptor<TSource>[];
}
export declare enum FormationMask {
    HashKey = 1,
    RangeKey = 2,
    Body = 4,
    KeyOnly = 3,
    Full = 7
}
export declare enum ComparisonOperator {
    EQ = "EQ",
    NE = "NE",
    LE = "LE",
    LT = "LT",
    GE = "GE",
    GT = "GT",
    NOT_NULL = "NOT_NULL",
    NULL = "NULL",
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    BEGINS_WITH = "BEGINS_WITH",
    IN = "IN",
    BETWEEN = "BETWEEN"
}
export interface ScanFilterAddArgs<TSource> {
    targetSourcePropertyName: keyof TSource;
    comparisonOperator: ComparisonOperator;
    data: any[];
}
//# sourceMappingURL=type.d.ts.map