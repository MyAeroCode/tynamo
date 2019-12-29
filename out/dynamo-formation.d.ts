import { FormationMask, Item, DeserializerArg } from "./type";
declare class DynamoFormation {
    formation<TObject>(object: TObject, formationType?: FormationMask): Item;
    deformation<TObject>(dynamo: Item, classObject: any, context?: DeserializerArg): TObject;
}
declare const dynamoFormation: DynamoFormation;
export default dynamoFormation;
//# sourceMappingURL=dynamo-formation.d.ts.map