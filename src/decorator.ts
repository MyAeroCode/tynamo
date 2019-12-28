import { FieldDecoratorArgs, FieldDescriptor, FieldtypeOrChunk } from "./type";
import { defaultDatatype, defaultSerialize, defaultDeserialize } from "./utils";
import dynamoMapper from "./metadata";

// Class Member Decorator:
//      Add this field to DynamoItem.
//
export function DynamoField<TObject>(dynamoFieldType: FieldtypeOrChunk, args?: FieldDecoratorArgs<TObject>) {
    return function createDynamoFieldDecorator(target: Object, objectPropertyName: string | symbol): void {
        let descriptor: FieldDescriptor<TObject> = {
            class: target,
            dynamoFieldtype: dynamoFieldType,
            dynamoDatatypeName: args?.dynamoDatatypeName ? args.dynamoDatatypeName : defaultDatatype,
            serializer: args?.serialize ? args.serialize : defaultSerialize,
            deserializer: args?.deserialize ? args.deserialize : defaultDeserialize,
            objectPropertyName: objectPropertyName.toString(),
            dynamoPropertyName: args?.dynamoPropertyName ? args.dynamoPropertyName : objectPropertyName.toString()
        };
        dynamoMapper.add(descriptor);
    };
}
