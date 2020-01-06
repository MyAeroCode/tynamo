import { AttributeMap, TableName, LocalSecondaryIndexList, GlobalSecondaryIndexList, BillingMode, ProvisionedThroughput, StreamSpecification, SSESpecification, TagList, ReturnValue, ReturnConsumedCapacity, ReturnItemCollectionMetrics, ConditionExpression, ExpressionAttributeNameMap, ConsistentRead, ProjectionExpression, ConsumedCapacity, ItemCollectionMetrics, PutItemOutput } from "aws-sdk/clients/dynamodb";
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
export declare class SerializerArg<TSource> {
    source: TSource;
    propertyDescriptor: PropertyDescriptor<TSource>;
}
export declare class DeserializerArg {
    dynamo: AttributeMap;
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
export interface TableInformation<TSource = any> {
    TableName: TableName;
    LocalSecondaryIndexes?: LocalSecondaryIndexList;
    GlobalSecondaryIndexes?: GlobalSecondaryIndexList;
    BillingMode?: BillingMode;
    ProvisionedThroughput?: ProvisionedThroughput;
    StreamSpecification?: StreamSpecification;
    SSESpecification?: SSESpecification;
    Tags?: TagList;
}
export interface TynamoPutItemInput<TSource> {
    Item: TSource;
    ArgsItem?: any;
    ReturnValues?: ReturnValue;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
    ConditionExpression?: ConditionExpression;
}
export interface TynamoPutItemOutput<TSource> {
    $response: AWS.Response<PutItemOutput, AWS.AWSError>;
    Attributes?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
    ItemCollectionMetrics?: ItemCollectionMetrics;
}
export interface TynamoGetItemInput<TSource> {
    Key: TSource;
    ConsistentRead?: ConsistentRead;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ProjectionExpression?: ProjectionExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
}
export interface TynamoGetItemOutput<TSource> {
    Item?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
}
//# sourceMappingURL=type.d.ts.map