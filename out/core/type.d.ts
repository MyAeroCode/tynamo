import { AttributeMap, TableName, LocalSecondaryIndexList, GlobalSecondaryIndexList, BillingMode, ProvisionedThroughput, StreamSpecification, SSESpecification, TagList, ReturnValue, ReturnConsumedCapacity, ReturnItemCollectionMetrics, ConditionExpression, ExpressionAttributeNameMap, ExpressionAttributeValueMap, ConsistentRead, ProjectionExpression, ConsumedCapacity, ItemCollectionMetrics, PutItemOutput, DeleteItemOutput, UpdateExpression, UpdateItemOutput, IndexName, PositiveIntegerObject, Select, ScanTotalSegments, ScanSegment, Integer, ScanOutput, BooleanObject, KeyExpression, QueryOutput, ConsumedCapacityMultiple, BatchGetItemOutput, ItemCollectionMetricsPerTable, BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";
import { Response, AWSError } from "aws-sdk";
export declare type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export declare type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;
export declare type ClassCapture<T extends {}> = {
    new (...args: any[]): T;
};
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
    propertyDescriptor: PropertyDescriptor<TSource, any>;
}
export declare class DeserializerArg<TSource> {
    dynamo: AttributeMap;
    propertyDescriptor: PropertyDescriptor<TSource, any>;
}
export declare class PropertyDecoratorArgs {
    keyType: KeyType;
    dataType?: DataType;
    sourceDataType?: ClassCapture<any>;
    propertyName?: string;
    nullable?: boolean;
    serializer?: Serializer<any, any>;
    deserializer?: Deserializer<any>;
}
export declare class PropertyDescriptor<TSource, TParam> {
    nullable: boolean;
    serializer: Serializer<TSource, TParam>;
    deserializer: Deserializer<TSource>;
    sourceDataType: ClassCapture<TSource>;
    dynamoKeyType: KeyType;
    dynamoDataType: DataType;
    sourcePropertyName: string;
    dynamoPropertyName: string;
}
export declare type Serializer<TSource, TParam = any> = Chunk<TParam, SerializerArg<TSource>>;
export declare type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg<TSource>>;
export declare class EntityDescriptor<TSource> {
    TClass: ClassCapture<TSource>;
    hash: PropertyDescriptor<TSource, any>;
    sort?: PropertyDescriptor<TSource, any>;
    attr: PropertyDescriptor<TSource, any>[];
}
export declare enum FormationMask {
    HashKey = 1,
    RangeKey = 2,
    Body = 4,
    KeyOnly = 3,
    Full = 7
}
export interface TableInformation {
    TableName: TableName;
    LocalSecondaryIndexes?: LocalSecondaryIndexList;
    GlobalSecondaryIndexes?: GlobalSecondaryIndexList;
    BillingMode?: BillingMode;
    ProvisionedThroughput?: ProvisionedThroughput;
    StreamSpecification?: StreamSpecification;
    SSESpecification?: SSESpecification;
    Tags?: TagList;
}
export interface TynamoExpressionInput {
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
    KeyConditionExpression?: KeyExpression;
    ConditionExpression?: ConditionExpression;
    ProjectionExpression?: ProjectionExpression;
    UpdateExpression?: UpdateExpression;
    FilterExpression?: ConditionExpression;
}
export interface TynamoExpressionOutput {
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: ExpressionAttributeValueMap;
    KeyConditionExpression?: KeyExpression;
    ConditionExpression?: ConditionExpression;
    ProjectionExpression?: ProjectionExpression;
    UpdateExpression?: UpdateExpression;
    FilterExpression?: ConditionExpression;
}
export interface TynamoPutItemInput<TSource> {
    Item: TSource;
    ReturnValues?: ReturnValue;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
    ConditionExpression?: ConditionExpression;
}
export interface TynamoPutItemOutput<TSource> {
    $response: AWS.Response<PutItemOutput, AWS.AWSError>;
    Attributes?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
    ItemCollectionMetrics?: ItemCollectionMetrics;
}
export interface TynamoGetItemInput<TSource> {
    Key: Partial<TSource>;
    ConsistentRead?: ConsistentRead;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ProjectionExpression?: ProjectionExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
}
export interface TynamoGetItemOutput<TSource> {
    $response: AWS.Response<AWS.DynamoDB.GetItemOutput, AWS.AWSError>;
    Item?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
}
export interface TynamoDeleteItemInput<TSource> {
    Key: Partial<TSource>;
    ExpressionAttributeValues?: any;
    ReturnValues?: ReturnValue;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
    ConditionExpression?: ConditionExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
}
export interface TynamoDeleteItemOutput<TSource> {
    $response: AWS.Response<DeleteItemOutput, AWS.AWSError>;
    Attributes?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
    ItemCollectionMetrics?: ItemCollectionMetrics;
}
export interface TynamoUpdateItemInput<TSource> {
    Key: Partial<TSource>;
    ReturnValues?: ReturnValue;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
    ConditionExpression?: ConditionExpression;
    UpdateExpression?: UpdateExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
}
export interface TynamoUpdateItemOutput<TSource> {
    $response: AWS.Response<UpdateItemOutput, AWS.AWSError>;
    Attributes?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
    ItemCollectionMetrics?: ItemCollectionMetrics;
}
export interface TynamoScanInput<TSource> {
    IndexName?: IndexName;
    Limit?: PositiveIntegerObject;
    Select?: Select;
    ExclusiveStartKey?: TSource;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    TotalSegments?: ScanTotalSegments;
    Segment?: ScanSegment;
    ProjectionExpression?: ProjectionExpression;
    FilterExpression?: ConditionExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
    ConsistentRead?: ConsistentRead;
}
export interface TynamoScanOutput<TSource> {
    $response: AWS.Response<ScanOutput, AWS.AWSError>;
    Items?: TSource[];
    Count?: Integer;
    ScannedCount?: Integer;
    LastEvaluatedKey?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
}
export interface TynamoQueryInput<TSource> {
    IndexName?: IndexName;
    Select?: Select;
    Limit?: PositiveIntegerObject;
    ConsistentRead?: ConsistentRead;
    ScanIndexForward?: BooleanObject;
    ExclusiveStartKey?: TSource;
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ProjectionExpression?: ProjectionExpression;
    FilterExpression?: ConditionExpression;
    KeyConditionExpression?: KeyExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
}
export interface TynamoQueryOutput<TSource> {
    $response: AWS.Response<QueryOutput, AWS.AWSError>;
    Items?: TSource[];
    Count?: Integer;
    ScannedCount?: Integer;
    LastEvaluatedKey?: TSource;
    ConsumedCapacity?: ConsumedCapacity;
}
export interface TynamoBatchGetItemInput<TSource> {
    RequestItems: Partial<TSource>[];
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ConsistentRead?: ConsistentRead;
    ProjectionExpression?: ProjectionExpression;
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
}
export interface TynamoBatchGetItemOutput<TSource> {
    $response?: Response<BatchGetItemOutput, AWSError>;
    Responses?: TSource[];
    UnprocessedKeys?: Partial<TSource>[];
    ConsumedCapacity?: ConsumedCapacityMultiple;
}
export declare type PutOrDelete<TSource> = {
    Operation: "put";
    Item: TSource;
} | {
    Operation: "delete";
    Key: Partial<TSource>;
};
export interface TynamoBatchWriteItemInput<TSource> {
    RequestItems: PutOrDelete<TSource>[];
    ReturnConsumedCapacity?: ReturnConsumedCapacity;
    ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
}
export interface TynamoBatchWriteItemOutput<TSource> {
    $response: Response<BatchWriteItemOutput, AWSError>;
    UnprocessedItems?: PutOrDelete<TSource>[];
    ItemCollectionMetrics?: ItemCollectionMetricsPerTable;
    ConsumedCapacity?: ConsumedCapacityMultiple;
}
//# sourceMappingURL=type.d.ts.map