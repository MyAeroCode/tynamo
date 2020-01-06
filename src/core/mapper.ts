import { FormationMask, PropertyDescriptor, DataType, EntityDescriptor } from "./type";
import MetaData from "./metadata";
import { fetchFromChunkOrValue } from "./utils";
import { AttributeMap, AttributeValue } from "aws-sdk/clients/dynamodb";
import { MetaDataKey } from "./key";

/**
 * Performs the interconversion between source and DynamoObject.
 */
class Mapper {
    /**
     * Convert scalar to AttributeValue(N|S|B).
     * (Undefined | null | EmptyString) is not allowd.
     *
     * For example,
     *  formationScalar( 1 , DataType.N) => { N :  1 }
     *  formationScalar("2", DataType.S) => { S : "2"}
     *  formationScalar("3", DataType.B) => { B : "3"}
     */
    formationScalar(scalar: any, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): AttributeValue {
        if (scalar === undefined || scalar === null || scalar === "") throw new Error(`'${scalar}' is not allowed.`);

        switch (dataType) {
            case DataType.S:
            case DataType.N:
            case DataType.B: {
                return {
                    [dataType]: scalar.toString()
                };
            }

            case DataType.BOOL: {
                return {
                    [dataType]: scalar
                };
            }
        }
    }

    /**
     * Convert scalarArray to AttributeValue(NS|SS|BS).
     *
     * For example,
     *  formationScalarArray([ 1 ,  2 ], DataType.NS) => { NS : ["1", "2"] }
     *  formationScalarArray(["3", "4"], DataType.SS) => { SS : ["3", "4"] }
     *  formationScalarArray(["5", "6"], DataType.BS) => { BS : ["5", "6"] }
     */
    formationScalarArray(scalarArray: any[], dataType: DataType.NS | DataType.SS | DataType.BS): AttributeValue {
        return {
            [dataType]: scalarArray.map((v) => v.toString())
        };
    }

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
    formationEntityArray(entityArray: any[], TClass: any): AttributeValue {
        return {
            [DataType.L]: entityArray.map((v) => this.formation(v, TClass))
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
    formationMap(source: any, TClass: any): AttributeValue {
        return {
            M: this.formation(source, TClass)
        };
    }

    /**
     * Formate target property using parentSource and propertyDescriptor.
     */
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): AttributeMap {
        const dynamoPropertyName: string = propertyDescriptor.dynamoPropertyName;

        // Serialize target property.
        const children = propertyDescriptor.serializer({
            source: parent,
            propertyDescriptor: propertyDescriptor
        });

        // Check)
        // Target property is null?
        // It is fine, when Target property is nullable.
        let realDataType: DataType = propertyDescriptor.dynamoDataType;
        if (children === undefined || children === null) {
            if (propertyDescriptor.nullable) realDataType = DataType.NULL;
            else throw new Error(`Non-nullable property sholud not NULL or undefined`);
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
            case DataType.N:
            case DataType.B:
            case DataType.BOOL: {
                return resolve(this.formationScalar(children, realDataType));
            }

            case DataType.SS:
            case DataType.NS:
            case DataType.BS: {
                return resolve(this.formationScalarArray(children, realDataType));
            }

            case DataType.L: {
                return resolve(this.formationEntityArray(children, propertyDescriptor.sourceDataType));
            }

            case DataType.M: {
                return resolve(this.formationMap(children, propertyDescriptor.sourceDataType));
            }

            case DataType.NULL: {
                return resolve({
                    NULL: true
                });
            }

            default: {
                throw new Error(`Can not detect DataType.`);
            }
        }
    }

    /**
     * Convert DynamoEntity to AttributeMap.
     */
    formation<TSource>(
        source: TSource | undefined,
        RootTClass: any,
        formationType: FormationMask = FormationMask.Full
    ): AttributeMap {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }

        // Simplify variable name.
        const entityDescriptor: EntityDescriptor<TSource> = MetaData.getEntityDescriptorByConstructor(RootTClass);
        const HASH = entityDescriptor.hash;
        const RANGE = entityDescriptor.sort;
        const ATTRS = entityDescriptor.attr;

        // Apply FormationMask.
        const targetPropertyDescriptors: PropertyDescriptor<TSource>[] = [];
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

    /**
     * Convert (N|S|B) to scalar.
     *
     * For example,
     *  deformationScalar({N: "3"}, DataType.N) =>  3
     *  deformationScalar({S: "X"}, DataType.S) => "X"
     *  deformationScalar({B: "_"}, DataType.B) => "_"
     */
    deformationScalar(
        scalarValue: AttributeValue,
        dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL
    ): any {
        if (scalarValue === undefined || scalarValue === undefined) {
            throw new Error(`'${scalarValue}' is not allowed.`);
        }

        switch (dataType) {
            case DataType.S:
            case DataType.B:
            case DataType.BOOL:
                return scalarValue[dataType];

            case DataType.N:
                return Number(scalarValue[dataType]);
        }
    }

    /**
     * Convert (SS|BS|SS) to scalarArray.
     *
     * For example,
     *  deformationScalarArray({NS: ["1", "3", "5"]}, DataType.NS) => [ 1 ,  3 ,  5 ]
     *  deformationScalarArray({SS: ["A", "B", "C"]}, DataType.SS) => ["A", "B", "C"]
     *  deformationScalarArray({BS: ["a", "b", "c"]}, DataType.BS) => ["a", "b", "c"]
     */
    deformationScalarArray(scalarArrayValue: AttributeValue, dataType: DataType.NS | DataType.SS | DataType.BS): any[] {
        switch (dataType) {
            case DataType.SS:
            case DataType.BS: {
                return (scalarArrayValue[dataType] as string[]).map((v) => String(v));
            }

            case DataType.NS: {
                return (scalarArrayValue[dataType] as string[]).map((v) => Number(v));
            }
        }
    }

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
    deformationEntityArray(entityArrayValue: AttributeValue, TClass: any): any[] {
        return (entityArrayValue[DataType.L] as any[]).map((v) => this.deformation(v, TClass));
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
    deformationProperty(parent: AttributeMap, propertyDescriptor: PropertyDescriptor<any>): any {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data: any): any {
            return {
                [sourcePropertyName]: data
            };
        }

        // Deserialize dynamoProperty.
        const deserialized: AttributeMap | any = fetchFromChunkOrValue<any>(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });

        // Return deformationed.
        if (deserialized.S) return resolve(this.deformationScalar(deserialized, DataType.S));
        if (deserialized.N) return resolve(this.deformationScalar(deserialized, DataType.N));
        if (deserialized.B) return resolve(this.deformationScalar(deserialized, DataType.B));
        if (deserialized.SS) return resolve(this.deformationScalarArray(deserialized, DataType.SS));
        if (deserialized.NS) return resolve(this.deformationScalarArray(deserialized, DataType.NS));
        if (deserialized.BS) return resolve(this.deformationScalarArray(deserialized, DataType.BS));
        if (deserialized.L) {
            return resolve(this.deformationEntityArray(deserialized, propertyDescriptor.sourceDataType));
        }
        if (deserialized.M) {
            return resolve(this.deformationMap(deserialized, propertyDescriptor.sourceDataType));
        }
        if (deserialized.BOOL) return resolve(this.deformationScalar(deserialized, DataType.BOOL));
        if (deserialized.NULL) return resolve(undefined);
        return deserialized;
    }

    /**
     * Convert AttributeMap to DynamoEntity.
     */
    deformation(target: AttributeMap, RootTClass: any): any {
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
        const propertyDescriptors: PropertyDescriptor<any>[] = [];
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
