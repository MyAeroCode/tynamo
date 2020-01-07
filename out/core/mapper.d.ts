import { FormationMask, PropertyDescriptor, ClassCapture } from "./type";
import { AttributeMap, AttributeValue, ListAttributeValue, MapAttributeValue, BinaryAttributeValue, BooleanAttributeValue } from "aws-sdk/clients/dynamodb";
import { NumberSetAttributeValue, StringSetAttributeValue, BinarySetAttributeValue, NumberAttributeValue } from "aws-sdk/clients/dynamodbstreams";
import { StringAttributeValue } from "aws-sdk/clients/clouddirectory";
/**
 * Performs the interconversion between source and DynamoObject.
 */
declare class Mapper {
    formationNumber(source: number): {
        N: NumberAttributeValue;
    };
    formationString(source: string): {
        S: StringAttributeValue;
    };
    formationBinary(source: string): {
        B: BinaryAttributeValue;
    };
    formationBoolean(source: boolean): {
        BOOL: BooleanAttributeValue;
    };
    formationNumberSet(source: number[]): {
        NS: NumberSetAttributeValue;
    };
    formationStringSet(source: string[]): {
        SS: StringSetAttributeValue;
    };
    formationBinarySet(source: string[]): {
        BS: BinarySetAttributeValue;
    };
    /**
     * Convert EntityArray to AttributeValue(L).
     * EntityArray should not contain scalar.
     *
     * For example,
     *  formationEntityArray([new Cat(0, "a"), new Cat(1, "b")], Cat) =>
     *  { L :
     *      [
     *          {M: {id:{N : "0"}, name:{S : "a"}}},
     *          {M: {id:{N : "1"}, name:{S : "b"}}}
     *      ]
     *  }
     */
    formationList<TSource>(source: TSource[], TClass: ClassCapture<TSource>): {
        L: ListAttributeValue;
    };
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
    formationMap<TSource>(source: TSource, TClass: ClassCapture<TSource>): AttributeValue;
    /**
     * Formate target property using parentSource and propertyDescriptor.
     */
    formationProperty<TSource>(parent: TSource, propertyDescriptor: PropertyDescriptor<TSource, any>): AttributeMap;
    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation<TSource>(source: TSource, TClass: ClassCapture<TSource>, formationType?: FormationMask): AttributeMap;
    deformationNumber(target: {
        N: NumberAttributeValue;
    }): number;
    deformationBinary(target: {
        B: BinaryAttributeValue;
    }): string;
    deformationString(target: {
        S: StringAttributeValue;
    }): string;
    deformationBoolean(target: {
        BOOL: BooleanAttributeValue;
    }): boolean;
    deformationNumberSet(target: {
        NS: NumberSetAttributeValue;
    }): number[];
    deformationBinarySet(target: {
        BS: BinarySetAttributeValue;
    }): string[];
    deformationStringSet(target: {
        SS: StringSetAttributeValue;
    }): string[];
    /**
     * Convert (L) to EntityArray.
     * L should have only one entity type.
     *
     * For example,
     *  deformationEntityArray({ L :
     *      [
     *          {M: {id:{N : "0"}, name:{S : "a"}}},
     *          {M: {id:{N : "1"}, name:{S : "b"}}}
     *      ]
     *  }, Cat) => [new Cat(0, "a"), new Cat(1, "b")]
     */
    deformationList<TTarget>(target: {
        L: MapAttributeValue[];
    }, TClass: ClassCapture<TTarget>): TTarget[];
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
    deformationProperty<TTarget>(parent: AttributeMap, propertyDescriptor: PropertyDescriptor<TTarget, any>): TTarget;
    /**
     * Convert AttributeMap to DynamoEntity.
     */
    deformation<TTarget>(target: AttributeMap, RootTClass: ClassCapture<TTarget>): TTarget;
}
declare const _: Mapper;
export default _;
//# sourceMappingURL=mapper.d.ts.map