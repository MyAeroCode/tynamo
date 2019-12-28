import { FormationType, Item } from "./type";
declare class DynamoFormation {
    formation<TObject>(object: TObject, formationType?: FormationType): Item;
    deformation<TObject>(dynamo: Item, classObject: any): TObject;
}
declare const dynamoFormation: DynamoFormation;
export default dynamoFormation;
//# sourceMappingURL=dynamo-formation.d.ts.map