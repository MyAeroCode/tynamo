import { FieldDecoratorArgs, FieldDescriptor, Fieldtype } from "./type";
import { defaultSerialize, defaultDeserialize, defaultDatatype } from "./utils";
import dynamoMapper from "./metadata";

// Class Member Decorator:
//      Add this field to DynamoItem.
//
export function DynamoField<TObject>(dynamoFieldType: Fieldtype, args?: FieldDecoratorArgs<TObject>) {
    return function createDynamoFieldDecorator(target: Object, objectPropertyName: string | symbol): void {
        if (!args) args = {};
        if (!args.datatype) args.datatype = defaultDatatype;
        if (!args.serializer) args.serializer = defaultSerialize;
        if (!args.deserializer) args.deserializer = defaultDeserialize;
        if (!args.propertyName) args.propertyName = objectPropertyName.toString();

        const descriptor: FieldDescriptor<TObject> = {
            class: target,
            fieldtype: dynamoFieldType,
            datatype: args.datatype,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            objectPropertyName: objectPropertyName.toString()
        };
        dynamoMapper.add(descriptor);
    };
}
