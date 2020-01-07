import {
    AttributeMap,
    AttributeValue,
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
    ConditionalOperator,
    ConditionExpression,
    ExpressionAttributeNameMap,
    ExpressionAttributeValueMap,
    Key,
    AttributeNameList,
    ConsistentRead,
    ProjectionExpression,
    ConsumedCapacity,
    ItemCollectionMetrics,
    PutItemOutput
} from "aws-sdk/clients/dynamodb";

export type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;

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
    propertyDescriptor!: PropertyDescriptor<TSource>;
}

// The argument of the Deserializer function.
export class DeserializerArg {
    dynamo!: AttributeMap;
    propertyDescriptor!: PropertyDescriptor<any>;
}

// Parameters to create the PropertyDescriptor.
// Used in the DynamoItemField Decorator.
export class PropertyDecoratorArgs<TSource> {
    keyType!: KeyType;
    dataType?: DataType;
    sourceDataType?: any;
    propertyName?: string;
    nullable?: boolean;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}

// Describe how one property in DynamoItem is created.
// It also contain how to return to the original property from the DynamoItem property.
export class PropertyDescriptor<TSource> {
    nullable!: boolean;
    serializer!: Serializer<TSource>;
    deserializer!: Deserializer<TSource>;
    sourceDataType!: any;
    dynamoKeyType!: KeyType;
    dynamoDataType!: DataType;
    sourcePropertyName!: string;
    dynamoPropertyName!: string;
}
export type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;

// Describe how one entity of DynamoDB is created.
export class EntityDescriptor<TSource> {
    TClass!: any;
    hash!: PropertyDescriptor<TSource>;
    sort?: PropertyDescriptor<TSource>;
    attr!: PropertyDescriptor<TSource>[];
}

export enum FormationMask {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011,
    Full = 0b111
}

export interface TableInformation<TSource = any> {
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

export interface TynamoPutItemInput<TSource> {
    // TableName: TableName;
    // Item: PutItemInputAttributeMap;
    // Expected?: ExpectedAttributeMap;
    // ExpressionAttributeValues?: ExpressionAttributeValueMap;
    // ConditionalOperator?: ConditionalOperator;
    Item: TSource;
    ValueItem?: any;
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
    // TableName: TableName;
    // AttributesToGet?: AttributeNameList;
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
