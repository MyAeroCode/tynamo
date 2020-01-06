import "reflect-metadata";

// Core Feature.
import Tynamo from "./core/tynamo";
import Mapper from "./core/mapper";
import MetaData from "./core/metadata";
import ExpressionParser from "./core/expressionParser";
import {
    DataType,
    KeyType,
    SerializerArg,
    DeserializerArg,
    PropertyDecoratorArgs,
    PropertyDescriptor,
    Serializer,
    Deserializer,
    EntityDescriptor,
    FormationMask,
    TableInformation,
    TynamoPutItemInput,
    TynamoPutItemOutput,
    TynamoGetItemInput,
    TynamoGetItemOutput
} from "./core/type";
import { AttributeMap, AttributeValue } from "aws-sdk/clients/dynamodb";

// Decorator.
import { DynamoProperty } from "./decorator/dynamo-property";
import { DynamoEntity } from "./decorator/dynamo-entity";

// Export.
export {
    AttributeMap,
    AttributeValue,
    Tynamo,
    Mapper,
    MetaData,
    ExpressionParser,
    DynamoEntity,
    DynamoProperty,
    DataType,
    KeyType,
    SerializerArg,
    DeserializerArg,
    PropertyDecoratorArgs,
    PropertyDescriptor,
    Serializer,
    Deserializer,
    EntityDescriptor,
    FormationMask,
    TableInformation,
    TynamoPutItemInput,
    TynamoPutItemOutput,
    TynamoGetItemInput,
    TynamoGetItemOutput
};
