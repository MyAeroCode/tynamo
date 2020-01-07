import { FormationMask, PropertyDescriptor, DataType, EntityDescriptor, ClassCapture } from "./type";
import MetaData from "./metadata";
import { fetchFromChunk } from "./utils";
import {
    AttributeMap,
    AttributeValue,
    ListAttributeValue,
    MapAttributeValue,
    BinaryAttributeValue,
    BooleanAttributeValue
} from "aws-sdk/clients/dynamodb";
import { MetaDataKey } from "./key";
import {
    NumberSetAttributeValue,
    StringSetAttributeValue,
    BinarySetAttributeValue,
    NumberAttributeValue
} from "aws-sdk/clients/dynamodbstreams";
import { StringAttributeValue } from "aws-sdk/clients/clouddirectory";

/**
 * Performs the interconversion between source and DynamoObject.
 */
class Mapper {
    formationNumber(source: number): { N: NumberAttributeValue } {
        return { N: String(source) };
    }

    formationString(source: string): { S: StringAttributeValue } {
        return { S: source };
    }

    formationBinary(source: string): { B: BinaryAttributeValue } {
        return { B: source };
    }

    formationBoolean(source: boolean): { BOOL: BooleanAttributeValue } {
        return { BOOL: source };
    }

    formationNumberSet(source: number[]): { NS: NumberSetAttributeValue } {
        return { NS: source.map((v) => String(v)) };
    }

    formationStringSet(source: string[]): { SS: StringSetAttributeValue } {
        return { SS: source };
    }

    formationBinarySet(source: string[]): { BS: BinarySetAttributeValue } {
        return { BS: source };
    }

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
    formationList<TSource>(source: TSource[], TClass: ClassCapture<TSource>): { L: ListAttributeValue } {
        return {
            [DataType.L]: source.map((v) => this.formationMap(v, TClass))
        };
    }

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
    formationMap<TSource>(source: TSource, TClass: ClassCapture<TSource>): AttributeValue {
        return {
            M: this.formation(source, TClass)
        };
    }

    /**
     * Formate target property using parentSource and propertyDescriptor.
     */
    formationProperty<TSource>(parent: TSource, propertyDescriptor: PropertyDescriptor<TSource, any>): AttributeMap {
        const dynamoPropertyName: string = propertyDescriptor.dynamoPropertyName;

        // Serialize target property.
        const serialized = propertyDescriptor.serializer({
            source: parent,
            propertyDescriptor: propertyDescriptor
        });

        // Check)
        // Target property is null?
        // It is fine, when Target property is nullable.
        let realDataType: DataType = propertyDescriptor.dynamoDataType;
        if (serialized === undefined || serialized === null) {
            if (propertyDescriptor.nullable) realDataType = DataType.NULL;
            else throw new Error(`Non-nullable property sholud not NULL or undefined`);
        }

        // Check)
        // Target property is empty string?
        if (serialized === "") {
            throw new Error(`Empty string is not allowed.`);
        }

        // Create DynamoItem using by AttributeValue.
        function resolve(value: AttributeValue): AttributeMap {
            return {
                [dynamoPropertyName]: value
            };
        }

        // Try formation.
        switch (realDataType) {
            case DataType.S:
                return resolve(this.formationString(serialized));
            case DataType.N:
                return resolve(this.formationNumber(serialized));
            case DataType.B:
                return resolve(this.formationBinary(serialized));
            case DataType.BOOL:
                return resolve(this.formationBoolean(serialized));
            case DataType.SS:
                return resolve(this.formationStringSet(serialized));
            case DataType.NS:
                return resolve(this.formationNumberSet(serialized));
            case DataType.BS:
                return resolve(this.formationBinarySet(serialized));
            case DataType.L:
                return resolve(this.formationList(serialized, propertyDescriptor.sourceDataType));
            case DataType.M:
                return resolve(this.formationMap(serialized, propertyDescriptor.sourceDataType));
            case DataType.NULL:
                return resolve({ NULL: true });
            default: {
                throw new Error(`Can not detect DataType.`);
            }
        }
    }

    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation<TSource>(
        source: TSource,
        TClass: ClassCapture<TSource>,
        formationType: FormationMask = FormationMask.Full
    ): AttributeMap {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }

        // Simplify variable name.
        const entityDescriptor: EntityDescriptor<TSource> = MetaData.getEntityDescriptorByConstructor(TClass);
        const HASH = entityDescriptor.hash;
        const RANGE = entityDescriptor.sort;
        const ATTRS = entityDescriptor.attr;

        // Apply FormationMask.
        const targetPropertyDescriptors: PropertyDescriptor<TSource, any>[] = [];
        if (formationType & FormationMask.HashKey && HASH) targetPropertyDescriptors.push(HASH);
        if (formationType & FormationMask.RangeKey && RANGE) targetPropertyDescriptors.push(RANGE);
        if (formationType & FormationMask.Body) targetPropertyDescriptors.push(...ATTRS!!.values());

        // Try formation and merge.
        const dynamo: AttributeMap = {};
        for (const propertyDescriptor of targetPropertyDescriptors) {
            const dynamoProperty = this.formationProperty(source, propertyDescriptor);
            Object.assign(dynamo, dynamoProperty);
        }
        return dynamo;
    }

    deformationNumber(target: { N: NumberAttributeValue }): number {
        return Number(target.N);
    }

    deformationBinary(target: { B: BinaryAttributeValue }): string {
        return String(target.B);
    }

    deformationString(target: { S: StringAttributeValue }): string {
        return target.S;
    }

    deformationBoolean(target: { BOOL: BooleanAttributeValue }): boolean {
        return target.BOOL;
    }

    deformationNumberSet(target: { NS: NumberSetAttributeValue }): number[] {
        return target.NS.map((v) => Number(v));
    }

    deformationBinarySet(target: { BS: BinarySetAttributeValue }): string[] {
        return target.BS.map((v) => String(v));
    }

    deformationStringSet(target: { SS: StringSetAttributeValue }): string[] {
        return target.SS;
    }

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
    deformationList<TTarget>(target: { L: MapAttributeValue[] }, TClass: ClassCapture<TTarget>): TTarget[] {
        return (target[DataType.L] as any[]).map((v) => this.deformationMap(v, TClass));
    }

    /**
     * Convert (M) to entity.
     *
     * For example,
     *  deformationMap({ M :
     *      id   : {N : "0"},
     *      name : {S : "a"}
     *  }, Cat) => new Cat(0, "a")
     */
    deformationMap(dynamo: AttributeValue, TClass: any): any {
        return this.deformation(dynamo.M!!, TClass);
    }

    /**
     * Deformate target property using parentAttributeMap and propertyDescriptor.
     */
    deformationProperty<TTarget>(parent: AttributeMap, propertyDescriptor: PropertyDescriptor<TTarget, any>): TTarget {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data: any): any {
            return {
                [sourcePropertyName]: data
            };
        }

        // Deserialize dynamoProperty.
        const deserialized: AttributeMap | any = fetchFromChunk<any, any>(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });

        // Return deformationed.
        if (deserialized.S) return resolve(this.deformationString(deserialized));
        if (deserialized.N) return resolve(this.deformationNumber(deserialized));
        if (deserialized.B) return resolve(this.deformationBinary(deserialized));
        if (deserialized.SS) return resolve(this.deformationStringSet(deserialized));
        if (deserialized.NS) return resolve(this.deformationNumberSet(deserialized));
        if (deserialized.BS) return resolve(this.deformationBinarySet(deserialized));
        if (deserialized.BOOL) return resolve(this.deformationBoolean(deserialized));
        if (deserialized.NULL) return resolve(undefined);
        if (deserialized.L) return resolve(this.deformationList(deserialized, propertyDescriptor.sourceDataType));
        if (deserialized.M) return resolve(this.deformationMap(deserialized, propertyDescriptor.sourceDataType));
        return deserialized;
    }

    /**
     * Convert AttributeMap to DynamoEntity.
     */
    deformation<TTarget>(target: AttributeMap, RootTClass: ClassCapture<TTarget>): TTarget {
        // Check if, object is empty.
        if (target === undefined) {
            throw new Error(`Empty object is not allowed`);
        }

        // Validation check.
        // Is it registered in the metadata?
        const TClass: any = Reflect.getMetadata(MetaDataKey.TClass, RootTClass);
        const holder: any = new TClass();
        const entityDescriptor: EntityDescriptor<any> = MetaData.getEntityDescriptorByConstructor(holder.constructor);

        // Gets all field descriptor to create the Object.
        const propertyDescriptors: PropertyDescriptor<TTarget, any>[] = [];
        if (entityDescriptor.hash) propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.sort) propertyDescriptors.push(entityDescriptor.sort);
        if (entityDescriptor.attr) propertyDescriptors.push(...entityDescriptor.attr.values());

        // Then deformation and merge all fields.
        for (const propertyDescriptor of propertyDescriptors) {
            if (target[propertyDescriptor.dynamoPropertyName] !== undefined) {
                const sourceProperty = this.deformationProperty(target, propertyDescriptor);
                Object.assign(holder, sourceProperty);
            }
        }
        return holder;
    }
}
const _ = new Mapper();
export default _;
