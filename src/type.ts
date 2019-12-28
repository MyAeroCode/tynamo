import { AttributeMap } from "aws-sdk/clients/dynamodb";

// May or may not exist.
export type Maybe<T> = T | undefined;

// Delay the Computing Time.
export type Chunk<TReturn, TParam> = () => (param: TParam) => TReturn;

// Calculate immediately with Value.
// or Delay the computing time through chunk.
export type ChunkOrValue<TObject, TParam> = TObject | Chunk<TObject, TParam>;

// The data type used by DynamoDB.
export type DataType =
    | "S" // An attribute of type String. For example:  "S": "Hello"
    | "N" // An attribute of type Number. For example:  "N": "123.45"  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
    | "B" // An attribute of type Binary. For example:  "B": "dGhpcyB0ZXh0IGlzIGJhc2U2NC1lbmNvZGVk"
    | "SS" // An attribute of type String Set. For example:  "SS": ["Giraffe", "Hippo" ,"Zebra"]
    | "NS" // An attribute of type Number Set. For example:  "NS": ["42.2", "-19", "7.5", "3.14"]  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
    | "BS" // An attribute of type Binary Set. For example:  "BS": ["U3Vubnk=", "UmFpbnk=", "U25vd3k="]
    | "M" // An attribute of type Map. For example:  "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}}
    | "L" // An attribute of type List. For example:  "L": [ {"S": "Cookies"} , {"S": "Coffee"}, {"N", "3.14159"}]
    | "NULL" // An attribute of type Null. For example:  "NULL": true
    | "BOOL"; // An attribute of type Boolean. For example:  "BOOL": true

// Item or item fragment of DynamoDB.
// It maybe a single field or multiple fields.
export type Item = AttributeMap;

// Key type of item field
export type FieldType = "Hash" | "Range" | "Attr";

// The argument of the Serializer internal function.
// e.g)
// function customSerializer(){
//                         v
//     return function(arg:SerializerArg) {
//         ...
//     }
// }
export interface SerializerArg<TObject> {
    object: TObject;
    objectPropertyName: string;
}

// The argument of the Deserializer internal function.
// e.g)
// function customDeserializer(){
//                         v
//     return function(arg:DeserializerArg) {
//         ...
//     }
// }
export interface DeserializerArg {
    dynamo: Item;
    dynamoPropertyName: string;
    dynamoDatatypeName: DataType;
    objectPropertyName: string;
}

// Parameters to create the DynamoFieldDescriber.
// Used in the DynamoItemField Decorator.
export interface FieldDecoratorArgs<TObject> {
    dynamoPropertyName?: ChunkOrValue<any, string>;
    dynamoDatatypeName?: ChunkOrValue<any, DataType>;
    serialize?: SerializerOrChunk<TObject>;
    deserialize?: DeserializerOrChunk<TObject>;
}

// Describe how one field is created in DynamoItem.
// It also describes how to return to the original fields from the DynamoItem field.
export interface FieldDescriptor<TObject> {
    class: Object;
    serializer: SerializerOrChunk<TObject>;
    deserializer: DeserializerOrChunk<TObject>;
    dynamoFieldtype: FieldtypeOrChunk;
    dynamoDatatypeName: DatatypeOrChunk;
    objectPropertyName: PropertyNameOrChunk;
    dynamoPropertyName: PropertyNameOrChunk;
}
export type SerializerOrChunk<TObject> = ChunkOrValue<any, SerializerArg<TObject>>;
export type DeserializerOrChunk<TObject> = ChunkOrValue<TObject, DeserializerArg>;
export type DatatypeOrChunk = ChunkOrValue<DataType, undefined>;
export type FieldtypeOrChunk = ChunkOrValue<FieldType, undefined>;
export type PropertyNameOrChunk = ChunkOrValue<string, undefined>;

// Describe how one table is created.
export type TableDescriptor<TObject> = {
    hash: Maybe<FieldDescriptor<TObject>>;
    range: Maybe<FieldDescriptor<TObject>>;
    attrs: Maybe<Map<string, FieldDescriptor<TObject>>>;
};

// Describe how all table is created.
export type GlobalDescriptor = {
    [classKey: string]: Maybe<TableDescriptor<any>>;
};

// Bitmask.
export enum FormationType {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011,
    Full = 0b111
}
