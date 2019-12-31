import { PropertyDecoratorArgs, PropertyType } from "./type";
export declare function DynamoEntity(TClass: any): void;
export declare function DynamoProperty<TObject>(propertyType: PropertyType, args?: PropertyDecoratorArgs<TObject>): (TClassObject: Object, sourcePropertyName: string | symbol) => void;
//# sourceMappingURL=decorator.d.ts.map