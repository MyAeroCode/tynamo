import { FormationMask, Item, PropertyDescriptor } from "./type";
declare class DynamoDBFormation {
    formationScalar(value: number | string | boolean): string | boolean;
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): Item;
    formation<TSource>(source: TSource | undefined, formationType?: FormationMask): Item;
    deformationProperty(parent: Item, propertyDescriptor: PropertyDescriptor<any>): any;
    deformation(dynamo: Item, TClass?: any): any;
}
declare const dynamoFormation: DynamoDBFormation;
export default dynamoFormation;
//# sourceMappingURL=dyformation.d.ts.map