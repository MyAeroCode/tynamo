import { AttributeMap, AttributeValue } from "aws-sdk/clients/dynamodb";

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
    BOOL = "BOOL", // An attribute of type Boolean. For example:  "BOOL": true
    __SCALAR__ = "__SCALAR__" // Default, maybe S|N|B.
}

// Property Type of DynamoDB.
// Specially, HASH and RANGE are KeyType.
export enum PropertyType {
    hash = "HASH",
    range = "RANGE",
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
    dataType?: DataType;
    nullable?: boolean;
    propertyName?: string;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}

// Describe how one property in DynamoItem is created.
// It also contain how to return to the original property from the DynamoItem property.
export class PropertyDescriptor<TSource> {
    TClassName!: string;
    nullable!: boolean;
    dataType!: DataType;
    serializer!: Serializer<TSource>;
    deserializer!: Deserializer<TSource>;
    dynamoPropertyType!: PropertyType;
    sourcePropertyName!: string;
    dynamoPropertyName!: string;
}
export type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;

// Describe how one entity of DynamoDB is created.
export class EntityDescriptor<TSource> {
    TClass?: any;
    hash?: PropertyDescriptor<TSource>;
    range?: PropertyDescriptor<TSource>;
    attrs?: Map<string, PropertyDescriptor<TSource>>;
}
export enum FormationMask {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011,
    Full = 0b111
}
