import { PropertyDecoratorArgs, PropertyDescriptor, PropertyType, DataType } from "./type";
import { defaultSerializer, defaultDeserializer } from "./utils";
import MetaData from "./metadata";

// Class Decorator :
//      Add this class to metadata.
export function DynamoEntity(TClass: any) {
    MetaData.registEntity(TClass);
}

// Class Member Decorator:
//      Add this property to metadata.
//
export function DynamoProperty<TObject>(propertyType: PropertyType, args?: PropertyDecoratorArgs<TObject>) {
    return function createDynamoPropertyDecorator(TClassObject: Object, sourcePropertyName: string | symbol): void {
        // If not define propertyDecoratorArgs, create default.
        if (!args) args = {};
        if (!args.dataType) {
            const sourceDataType = Reflect.getMetadata("design:type", TClassObject, sourcePropertyName);
            switch (sourceDataType) {
                case String:
                    args.dataType = DataType.S;
                    break;

                case Number:
                    args.dataType = DataType.N;
                    break;

                case Boolean:
                    args.dataType = DataType.BOOL;
                    break;

                default:
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

        // Create property descriptor.
        const propertyDescriptor: PropertyDescriptor<TObject> = {
            TClassName: TClassObject.constructor.name,
            dynamoPropertyType: propertyType,
            dataType: args.dataType,
            nullable: args.nullable,
            serializer: args.serializer,
            deserializer: args.deserializer,
            dynamoPropertyName: args.propertyName,
            sourcePropertyName: sourcePropertyName.toString()
        };

        // Add to metadata.
        MetaData.registProperty(propertyDescriptor);
    };
}
