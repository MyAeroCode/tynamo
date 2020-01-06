import { PropertyDecoratorArgs } from "../core/type";
import MetaData from "../core/metadata";

/**
 * Class Member Decorator:
 *      Add this property to metadata.
 */
export function DynamoProperty<TObject>(args: PropertyDecoratorArgs<TObject>) {
    return function createDynamoPropertyDecorator(
        TClassObject: { constructor: any },
        sourcePropertyName: string | symbol
    ): void {
        MetaData.registProperty(TClassObject.constructor, sourcePropertyName.toString(), args);
    };
}
