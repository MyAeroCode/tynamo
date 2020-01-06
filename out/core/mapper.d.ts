import { FormationMask, PropertyDescriptor, DataType } from "./type";
import { AttributeMap, AttributeValue } from "aws-sdk/clients/dynamodb";
/**
 * Performs the interconversion between source and DynamoObject.
 */
declare class Mapper {
    /**
     * Convert scalar to AttributeValue(N|S|B).
     * (Undefined | null | EmptyString) is not allowd.
     *
     * For example,
     *  formationScalar( 1 , DataType.N) => { N :  1 }
     *  formationScalar("2", DataType.S) => { S : "2"}
     *  formationScalar("3", DataType.B) => { B : "3"}
     */
    formationScalar(scalar: any, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): AttributeValue;
    /**
     * Convert scalarArray to AttributeValue(NS|SS|BS).
     *
     * For example,
     *  formationScalarArray([ 1 ,  2 ], DataType.NS) => { NS : ["1", "2"] }
     *  formationScalarArray(["3", "4"], DataType.SS) => { SS : ["3", "4"] }
     *  formationScalarArray(["5", "6"], DataType.BS) => { BS : ["5", "6"] }
     */
    formationScalarArray(scalarArray: any[], dataType: DataType.NS | DataType.SS | DataType.BS): AttributeValue;
    /**
     * Convert EntityArray to AttributeValue(L).
     * EntityArray should not contain scalar.
     *
     * For example,
     *  formationEntityArray([new Cat(0, "a"), new Cat(1, "b")], Cat) =>
     *  { L :
     *      [
     *          {id:{N : "0"}, name:{S : "a"}},
     *          {id:{N : "1"}, name:{S : "b"}}
     *      ]
     *  }
     */
    formationEntityArray(entityArray: any[], TClass: any): AttributeValue;
    /**
     * Convert DynamoEntity to AttributeValue(M).
     *
     * For example,
     *  formationMap(new Cat(0, "a"), Cat) =>
     *  { M :
     *      id   : {N : "0"},
     *      name : {S : "a"}
     *  }
     */
    formationMap(source: any, TClass: any): AttributeValue;
    /**
     * Formate target property using parentSource and propertyDescriptor.
     */
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): AttributeMap;
    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation<TSource>(source: TSource | undefined, RootTClass: any, formationType?: FormationMask): AttributeMap;
    /**
     * Convert (N|S|B) to scalar.
     *
     * For example,
     *  deformationScalar({N: "3"}, DataType.N) =>  3
     *  deformationScalar({S: "X"}, DataType.S) => "X"
     *  deformationScalar({B: "_"}, DataType.B) => "_"
     */
    deformationScalar(scalarValue: AttributeValue, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): any;
    /**
     * Convert (SS|BS|SS) to scalarArray.
     *
     * For example,
     *  deformationScalarArray({NS: ["1", "3", "5"]}, DataType.NS) => [ 1 ,  3 ,  5 ]
     *  deformationScalarArray({SS: ["A", "B", "C"]}, DataType.SS) => ["A", "B", "C"]
     *  deformationScalarArray({BS: ["a", "b", "c"]}, DataType.BS) => ["a", "b", "c"]
     */
    deformationScalarArray(scalarArrayValue: AttributeValue, dataType: DataType.NS | DataType.SS | DataType.BS): any[];
    /**
     * Convert (L) to EntityArray.
     * L should have only one entity type.
     *
     * For example,
     *  deformationEntityArray({ L :
     *      [
     *          {id:{N : "0"}, name:{S : "a"}},
     *          {id:{N : "1"}, name:{S : "b"}}
     *      ]
     *  }, Cat) => [new Cat(0, "a"), new Cat(1, "b")]
     */
    deformationEntityArray(entityArrayValue: AttributeValue, TClass: any): any[];
    /**
     * Convert (M) to entity.
     *
     * For example,
     *  deformationMap({ M :
     *      id   : {N : "0"},
     *      name : {S : "a"}
     *  }, Cat) => new Cat(0, "a")
     */
    deformationMap(dynamo: AttributeValue, TClass: any): any;
    /**
     * Deformate target property using parentAttributeMap and propertyDescriptor.
     */
    deformationProperty(parent: AttributeMap, propertyDescriptor: PropertyDescriptor<any>): any;
    /**
     * Convert AttributeMap to DynamoEntity.
     */
    deformation(target: AttributeMap, RootTClass: any): any;
}
declare const _: Mapper;
export default _;
//# sourceMappingURL=mapper.d.ts.map