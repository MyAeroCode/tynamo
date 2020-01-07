import { PropertyDecoratorArgs, ClassCapture } from "../core/type";
import MetaData from "../core/metadata";

/**
 * Class Member Decorator:
 *      Add this property to metadata.
 */
export function DynamoProperty(args: PropertyDecoratorArgs) {
    return function createDynamoPropertyDecorator(TClass: any, sourcePropertyName: string | symbol): void {
        MetaData.registProperty(TClass.constructor, sourcePropertyName.toString(), args);
    };
}
