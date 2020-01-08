import {
    AttributeMap,
    TableName,
    LocalSecondaryIndexList,
    GlobalSecondaryIndexList,
    BillingMode,
    ProvisionedThroughput,
    StreamSpecification,
    SSESpecification,
    TagList,
    ReturnValue,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics,
    ConditionExpression,
    ExpressionAttributeNameMap,
    ExpressionAttributeValueMap,
    ConsistentRead,
    ProjectionExpression,
    ConsumedCapacity,
    ItemCollectionMetrics,
    PutItemOutput,
    DeleteItemOutput,
    UpdateExpression,
    UpdateItemOutput,
    IndexName,
    PositiveIntegerObject,
    Select,
    ScanTotalSegments,
    ScanSegment,
    Integer,
    ScanOutput,
    BooleanObject,
    KeyExpression,
    QueryOutput,
    ConsumedCapacityMultiple,
    BatchGetItemOutput,
    ItemCollectionMetricsPerTable,
    BatchWriteItemOutput
} from "aws-sdk/clients/dynamodb";
import { Response, AWSError } from "aws-sdk";

export type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;
export type ClassCapture<T extends {}> = { new (...args: any[]): T };

// The DataType used in DynamoDB.
export enum DataType {
    S = "S", // An attribute of type String. For example:  "S": "Hello"
    N = "N", // An attribute of type Number. For example:  "N": "123.45"  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
    B = "B", // An attribute of type Binary. For example:  "B": "dGhpcyB0ZXh0IGlzIGJhc2U2NC1lbmNvZGVk"
    SS = "SS", // An attribute of type String Set. For example:  "SS": ["Giraffe", "Hippo" ,"Zebra"]
    NS = "NS", // An attribute of type Number Set. For example:  "NS": ["42.2", "-19", "7.5", "3.14"]  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
    BS = "BS", // An attribute of type Binary Set. For example:  "BS": ["U3Vubnk=", "UmFpbnk=", "U25vd3k="]
    M = "M", // An attribute of type Map. For example:  "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}}
    L = "L", // An attribute of type List. For example:  "L": [ {"S": "Cookies"} , {"S": "Coffee"}, {"N", "3.14159"}]
    NULL = "NULL", // An attribute of type Null. For example:  "NULL": true
    BOOL = "BOOL" // An attribute of type Boolean. For example:  "BOOL": true
}

//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
//      Type for MetaData.
//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// Property Type of DynamoDB.
// Specially, HASH and RANGE are KeyType.
export enum KeyType {
    hash = "HASH",
    sort = "RANGE",
    attr = "ATTR"
}

// The argument of the Serializer function.
export class SerializerArg<TSource> {
    source!: TSource;
    propertyDescriptor!: PropertyDescriptor<TSource, any>;
}

// The argument of the Deserializer function.
export class DeserializerArg<TSource> {
    dynamo!: AttributeMap;
    propertyDescriptor!: PropertyDescriptor<TSource, any>;
}

// Parameters to create the PropertyDescriptor.
// Used in the DynamoItemField Decorator.
export class PropertyDecoratorArgs {
    keyType!: KeyType;
    dataType?: DataType;
    sourceDataType?: ClassCapture<any>;
    propertyName?: string;
    nullable?: boolean;
    serializer?: Serializer<any, any>;
    deserializer?: Deserializer<any>;
}

// Describe how one property in DynamoItem is created.
// It also contain how to return to the original property from the DynamoItem property.
export class PropertyDescriptor<TSource, TParam> {
    nullable!: boolean;
    serializer!: Serializer<TSource, TParam>;
    deserializer!: Deserializer<TSource>;
    sourceDataType!: ClassCapture<TSource>;
    dynamoKeyType!: KeyType;
    dynamoDataType!: DataType;
    sourcePropertyName!: string;
    dynamoPropertyName!: string;
}
export type Serializer<TSource, TParam = any> = Chunk<TParam, SerializerArg<TSource>>;
export type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg<TSource>>;

// Describe how one entity of DynamoDB is created.
export class EntityDescriptor<TSource> {
    TClass!: ClassCapture<TSource>;
    hash!: PropertyDescriptor<TSource, any>;
    sort?: PropertyDescriptor<TSource, any>;
    attr!: PropertyDescriptor<TSource, any>[];
}

export enum FormationMask {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011,
    Full = 0b111
}

export interface TableInformation {
    // AttributeDefinitions: AttributeDefinitions;
    // KeySchema: KeySchema;
    TableName: TableName;
    LocalSecondaryIndexes?: LocalSecondaryIndexList;
    GlobalSecondaryIndexes?: GlobalSecondaryIndexList;
    BillingMode?: BillingMode;
    ProvisionedThroughput?: ProvisionedThroughput;
    StreamSpecification?: StreamSpecification;
    SSESpecification?: SSESpecification;
    Tags?: TagList;
}

//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
//      Type for Tynamo API.
//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
export interface TynamoExpressionInput {
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: any;
    ConditionExpression?: ConditionExpression;
    ProjectionExpression?: ProjectionExpression;
    UpdateExpression?: UpdateExpression;
    FilterExpression?: ConditionExpression;
}

export interface TynamoExpressionOutput {
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: ExpressionAttributeValueMap;
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
    // TableName: TableName;
    // AttributesToGet?: AttributeNameList;
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
    // TableName: TableName;
    // Expected?: ExpectedAttributeMap;
    // ConditionalOperator?: ConditionalOperator;
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
    // TableName: TableName;
    // AttributeUpdates?: AttributeUpdates;
    // Expected?: ExpectedAttributeMap;
    // ConditionalOperator?: ConditionalOperator;
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
    // TableName: TableName;
    // AttributesToGet?: AttributeNameList;
    // ScanFilter?: FilterConditionMap;
    // ConditionalOperator?: ConditionalOperator;
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
    // AttributesToGet?: AttributeNameList;
    // KeyConditions?: KeyConditions;
    // QueryFilter?: FilterConditionMap;
    // ConditionalOperator?: ConditionalOperator;
    // TableName: TableName;
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

export type PutOrDelete<TSource> =
    | {
          Operation: "put";
          Item: TSource;
      }
    | {
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
