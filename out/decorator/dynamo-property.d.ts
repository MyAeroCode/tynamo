import { PropertyDecoratorArgs } from "../type";
/**
 * Class Member Decorator:
 *      Add this property to metadata.
 */
export declare function DynamoProperty<TObject>(args: PropertyDecoratorArgs<TObject>): (TClassObject: {
    constructor: any;
}, sourcePropertyName: string | symbol) => void;
//# sourceMappingURL=dynamo-property.d.ts.map