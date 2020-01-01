import { PropertyDecoratorArgs, PropertyDescriptor, PropertyType, DataType } from "./type";
import { defaultSerializer, defaultDeserializer } from "./utils";
import MetaData from "./metadata";

export function DynamoEntity(TClass: any) {
    MetaData.registEntity(TClass);
}

// Class Member Decorator:
//      Add this property to DynamoItem.
//
export function DynamoProperty<TObject>(propertyType: PropertyType, args?: PropertyDecoratorArgs<TObject>) {
    return function createDynamoPropertyDecorator(TClassObject: Object, sourcePropertyName: string | symbol): void {
        if (!args) args = {};
        if (!args.dataType) {
            const scalarClass = Reflect.getMetadata("design:type", TClassObject, sourcePropertyName);
            if (scalarClass === String) args.dataType = DataType.S;
            else if (scalarClass === Number) args.dataType = DataType.N;
            else if (scalarClass === Boolean) args.dataType = DataType.BOOL;
            else {
                throw new Error(
                    `Please specify DynamoPropertyDataType. -> [${
                        TClassObject.constructor.name
                    }.${sourcePropertyName.toString()}]`
                );
            }
        }
        if (!args.nullable) args.nullable = false;
        if (!args.serializer) args.serializer = defaultSerializer;
        if (!args.deserializer) args.deserializer = defaultDeserializer;
        if (!args.propertyName) args.propertyName = sourcePropertyName.toString();

        const descriptor: PropertyDescriptor<TObject> = {
            TClassName: TClassObject.constructor.name,
            dynamoPropertyType: propertyType,
            dataType: args.dataType,
            nullable: args.nullable,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            sourcePropertyName: sourcePropertyName.toString()
        };
        MetaData.registPropertyDescriptor(descriptor);
    };
}
