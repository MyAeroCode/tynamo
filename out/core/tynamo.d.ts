import { FormationMask, Item, PropertyDescriptor, DataType } from "../type";
import { AttributeValue } from "aws-sdk/clients/dynamodb";
declare class TynamoFormation {
    formationScalar(value: any, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): AttributeValue;
    formationList(array: any[], dataType: DataType.NS | DataType.SS | DataType.BS | DataType.L): AttributeValue;
    formationMap(source: any): AttributeValue;
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): Item;
    formation<TSource>(source: TSource | undefined, formationType?: FormationMask): Item;
    deformationScalar(value: AttributeValue, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): any;
    deformationList(array: AttributeValue, dataType: DataType.NS | DataType.SS | DataType.BS | DataType.L): any[];
    deformationMap(dynamo: AttributeValue): any;
    deformationProperty(parent: Item, propertyDescriptor: PropertyDescriptor<any>): any;
    deformation(dynamo: Item, TClass?: any): any;
}
declare const tynamoFormation: TynamoFormation;
export default tynamoFormation;
//# sourceMappingURL=tynamo.d.ts.map