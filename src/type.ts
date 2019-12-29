import { AttributeMap } from "aws-sdk/clients/dynamodb";

export type Chunk<TReturn, TArg> = (arg: TArg) => TReturn;
export type ChunkOrValue<TSource, TArg> = TSource | Chunk<TSource, TArg>;

// The data-type used in DynamoDB.
export enum Datatype {
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
    NESTED = "NESTED" // for nested class.
}

// Key type of item field
export enum Fieldtype {
    hash = "HASH",
    range = "RANGE",
    attr = "ATTR"
}

// Item or item fragment of DynamoDB.
// It maybe a single field or multiple fields.
export type Item = AttributeMap;

// The argument of the Datatype function.
export interface DatatypeArg<TSource> {
    source: TSource;
    sourcePropertyName: string;
}

// The argument of the Serializer function.
export interface SerializerArg<TSource> {
    source: TSource;
    sourcePropertyName: string;
}

// The argument of the Deserializer function.
export interface DeserializerArg {
    dynamo: Item;
    dynamoDatatype: Datatype;
    dynamoPropertyName: string;
    sourcePropertyName: string;
}

// Parameters to create the DynamoFieldDescriber.
// Used in the DynamoItemField Decorator.
export interface FieldDecoratorArgs<TSource> {
    datatype?: DatatypeOrChunk<TSource>;
    propertyName?: string;
    serializer?: Serializer<TSource>;
    deserializer?: Deserializer<TSource>;
}

// Describe how one field is created in DynamoItem.
// It also describes how to return to the original fields from the DynamoItem field.
export interface FieldDescriptor<TSource> {
    class: Object;
    serializer: Serializer<TSource>;
    deserializer: Deserializer<TSource>;
    datatype: DatatypeOrChunk<TSource>;
    fieldtype: Fieldtype;
    objectPropertyName: string;
    dynamoPropertyName: string;
}
export type Serializer<TSource> = Chunk<any, SerializerArg<TSource>>;
export type Deserializer<TSource> = Chunk<Partial<TSource>, DeserializerArg>;
export type DatatypeOrChunk<TSource> = ChunkOrValue<Datatype, DatatypeArg<TSource>>;

// Describe how one table is created.
export type TableDescriptor<TSource> = {
    hash?: FieldDescriptor<TSource>;
    range?: FieldDescriptor<TSource>;
    attrs?: Map<string, FieldDescriptor<TSource>>;
};

// Describe how all table is created.
export type GlobalDescriptor = {
    [classKey: string]: TableDescriptor<any> | undefined;
};

export enum FormationMask {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011,
    Full = 0b111
}
