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
    TagList
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

// Item or item fragment of DynamoDB.
// It can have more than 0 properties.
// e.g)  { }
// e.g)  {X: {N: "3"}, Y: {S: "Hello"}}
export type Item = AttributeMap;

// Value of property.
// e.g)  {N: "3"}
export type PropertyValue = AttributeValue;

// The argument of the DataType Resolver.
export class DataTypeResolverArg<TSource> {
    source!: TSource;
    sourcePropertyName!: string;
}

// The argument of the Serializer function.
export class SerializerArg<TSource> {
    source!: TSource;
    propertyDescriptor!: PropertyDescriptor<TSource>;
}

// The argument of the Deserializer function.
export class DeserializerArg {
    dynamo!: Item;
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

// Comparison Operator used in DynamoDB.
// @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Condition.html
export enum ComparisonOperator {
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

export interface TynamoCreateTableInput<TSource> {
    /**
     * An array of attributes that describe the key schema for the table and indexes.
     */
    // AttributeDefinitions: AttributeDefinitions;

    /**
     * Specifies the attributes that make up the primary key for a table or an index. The attributes in KeySchema must also be defined in the AttributeDefinitions array. For more information, see Data Model in the Amazon DynamoDB Developer Guide. Each KeySchemaElement in the array is composed of:    AttributeName - The name of this key attribute.    KeyType - The role that the key attribute will assume:    HASH - partition key    RANGE - sort key      The partition key of an item is also known as its hash attribute. The term "hash attribute" derives from the DynamoDB usage of an internal hash function to evenly distribute data items across partitions, based on their partition key values. The sort key of an item is also known as its range attribute. The term "range attribute" derives from the way DynamoDB stores items with the same partition key physically close together, in sorted order by the sort key value.  For a simple primary key (partition key), you must provide exactly one element with a KeyType of HASH. For a composite primary key (partition key and sort key), you must provide exactly two elements, in this order: The first element must have a KeyType of HASH, and the second element must have a KeyType of RANGE. For more information, see Working with Tables in the Amazon DynamoDB Developer Guide.
     */
    // KeySchema: KeySchema;

    /**
     * The name of the table to create.
     */
    TableName: Chunk<TableName, TSource>;

    /**
     * One or more local secondary indexes (the maximum is 5) to be created on the table. Each index is scoped to a given partition key value. There is a 10 GB size limit per partition key value; otherwise, the size of a local secondary index is unconstrained. Each local secondary index in the array includes the following:    IndexName - The name of the local secondary index. Must be unique only for this table.     KeySchema - Specifies the key schema for the local secondary index. The key schema must begin with the same partition key as the table.    Projection - Specifies attributes that are copied (projected) from the table into the index. These are in addition to the primary key attributes and index key attributes, which are automatically projected. Each attribute specification is composed of:    ProjectionType - One of the following:    KEYS_ONLY - Only the index and primary keys are projected into the index.    INCLUDE - Only the specified table attributes are projected into the index. The list of projected attributes is in NonKeyAttributes.    ALL - All of the table attributes are projected into the index.      NonKeyAttributes - A list of one or more non-key attribute names that are projected into the secondary index. The total count of attributes provided in NonKeyAttributes, summed across all of the secondary indexes, must not exceed 100. If you project the same attribute into two different indexes, this counts as two distinct attributes when determining the total.
     */
    LocalSecondaryIndexes?: LocalSecondaryIndexList;
    /**
     * One or more global secondary indexes (the maximum is 20) to be created on the table. Each global secondary index in the array includes the following:    IndexName - The name of the global secondary index. Must be unique only for this table.     KeySchema - Specifies the key schema for the global secondary index.    Projection - Specifies attributes that are copied (projected) from the table into the index. These are in addition to the primary key attributes and index key attributes, which are automatically projected. Each attribute specification is composed of:    ProjectionType - One of the following:    KEYS_ONLY - Only the index and primary keys are projected into the index.    INCLUDE - Only the specified table attributes are projected into the index. The list of projected attributes is in NonKeyAttributes.    ALL - All of the table attributes are projected into the index.      NonKeyAttributes - A list of one or more non-key attribute names that are projected into the secondary index. The total count of attributes provided in NonKeyAttributes, summed across all of the secondary indexes, must not exceed 100. If you project the same attribute into two different indexes, this counts as two distinct attributes when determining the total.      ProvisionedThroughput - The provisioned throughput settings for the global secondary index, consisting of read and write capacity units.
     */
    GlobalSecondaryIndexes?: GlobalSecondaryIndexList;
    /**
     * Controls how you are charged for read and write throughput and how you manage capacity. This setting can be changed later.    PROVISIONED - We recommend using PROVISIONED for predictable workloads. PROVISIONED sets the billing mode to Provisioned Mode.    PAY_PER_REQUEST - We recommend using PAY_PER_REQUEST for unpredictable workloads. PAY_PER_REQUEST sets the billing mode to On-Demand Mode.
     */
    BillingMode?: BillingMode;
    /**
     * Represents the provisioned throughput settings for a specified table or index. The settings can be modified using the UpdateTable operation.  If you set BillingMode as PROVISIONED, you must specify this property. If you set BillingMode as PAY_PER_REQUEST, you cannot specify this property.  For current minimum and maximum provisioned throughput values, see Limits in the Amazon DynamoDB Developer Guide.
     */
    ProvisionedThroughput?: ProvisionedThroughput;
    /**
     * The settings for DynamoDB Streams on the table. These settings consist of:    StreamEnabled - Indicates whether DynamoDB Streams is to be enabled (true) or disabled (false).    StreamViewType - When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values for StreamViewType are:    KEYS_ONLY - Only the key attributes of the modified item are written to the stream.    NEW_IMAGE - The entire item, as it appears after it was modified, is written to the stream.    OLD_IMAGE - The entire item, as it appeared before it was modified, is written to the stream.    NEW_AND_OLD_IMAGES - Both the new and the old item images of the item are written to the stream.
     */
    StreamSpecification?: StreamSpecification;
    /**
     * Represents the settings used to enable server-side encryption.
     */
    SSESpecification?: SSESpecification;
    /**
     * A list of key-value pairs to label the table. For more information, see Tagging for DynamoDB.
     */
    Tags?: TagList;
}
