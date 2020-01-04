import { FormationMask, Item, PropertyDescriptor, DataType } from "../type";
import { AttributeValue } from "aws-sdk/clients/dynamodb";
declare class TynamoFormation {
    formationScalar(value: any, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): AttributeValue;
    formationScalarList(array: any[], dataType: DataType.NS | DataType.SS | DataType.BS): AttributeValue;
    formationList(array: any[], TClass: any): AttributeValue;
    formationMap(source: any, TClass: any): AttributeValue;
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): Item;
    formation<TSource>(source: TSource | undefined, RootTClass: any, formationType?: FormationMask): Item;
    deformationScalar(value: AttributeValue, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): any;
    deformationScalarList(array: AttributeValue, dataType: DataType.NS | DataType.SS | DataType.BS): any[];
    deformationList(array: AttributeValue, TClass: any): any[];
    deformationMap(dynamo: AttributeValue, TClass: any): any;
    deformationProperty(parent: Item, propertyDescriptor: PropertyDescriptor<any>): any;
    deformation(dynamo: Item, RootTClass: any): any;
}
declare const tynamoFormation: TynamoFormation;
export default tynamoFormation;
//# sourceMappingURL=tynamo.d.ts.map