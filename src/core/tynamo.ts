import { FormationMask, Item, PropertyDescriptor, DataType, EntityDescriptor } from "../type";
import MetaData from "./metadata";
import { fetchFromChunkOrValue } from "./utils";
import { AttributeValue } from "aws-sdk/clients/dynamodb";

// Performs the interconversion between DynamoItem and the object.
//
class TynamoFormation {
    // Convert sourceScalar to dynamoScalar.
    //
    formationScalar(value: any, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): AttributeValue {
        if (value === undefined || value === null || value === "") throw new Error(`'${value}' is not allowed.`);

        switch (dataType) {
            case DataType.S:
            case DataType.N:
            case DataType.B: {
                return {
                    [dataType]: value.toString()
                };
            }

            case DataType.BOOL: {
                return {
                    [dataType]: value
                };
            }
        }
    }

    // Convert sourceList to dynamoList.
    //
    formationList(array: any[], dataType: DataType.NS | DataType.SS | DataType.BS | DataType.L): AttributeValue {
        switch (dataType) {
            case DataType.NS:
            case DataType.SS:
            case DataType.BS: {
                return {
                    [dataType]: array.map((v) => v.toString())
                };
            }

            case DataType.L: {
                return {
                    [dataType]: array.map((v) => this.formation(v))
                };
            }
        }
    }

    // Conver source to dynamoMap.
    //
    formationMap(source: any): AttributeValue {
        return {
            M: this.formation(source)
        };
    }

    // Convert sourceProperty to dynamoProperty.
    //
    formationProperty(parent: any, propertyDescriptor: PropertyDescriptor<any>): Item {
        const dynamoPropertyName: string = propertyDescriptor.dynamoPropertyName;
        let realDataType: DataType = propertyDescriptor.dataType;

        // custom property serializer check.
        const source = fetchFromChunkOrValue<any>(propertyDescriptor.serializer, {
            source: parent,
            propertyDescriptor: propertyDescriptor
        });

        // null check.
        if (source === undefined || source === null) {
            if (propertyDescriptor.nullable) realDataType = DataType.NULL;
            else throw new Error(`Non-nullable property sholud not NULL or undefined`);
        }

        function resolve(value: AttributeValue): Item {
            return {
                [dynamoPropertyName]: value
            };
        }

        switch (realDataType) {
            case DataType.S:
            case DataType.N:
            case DataType.B:
            case DataType.BOOL: {
                return resolve(this.formationScalar(source, realDataType));
            }

            case DataType.SS:
            case DataType.NS:
            case DataType.BS:
            case DataType.L: {
                return resolve(this.formationList(source, realDataType));
            }

            case DataType.M: {
                return resolve(this.formationMap(source));
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

    // Convert sourceObject to dynamoItem.
    //
    formation<TSource>(source: TSource | undefined, formationType: FormationMask = FormationMask.Full): Item {
        // Check if, source is empty.
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowed`);
        }

        const entityDescriptor: EntityDescriptor<TSource> = MetaData.getEntityDescriptorByHolder(source);
        const propertyDescriptors: PropertyDescriptor<TSource>[] = [];
        const HASH = entityDescriptor.hash;
        const RANGE = entityDescriptor.range;
        const ATTRS = entityDescriptor.attrs;

        if (formationType & FormationMask.HashKey && HASH) propertyDescriptors.push(HASH);
        if (formationType & FormationMask.RangeKey && RANGE) propertyDescriptors.push(RANGE);
        if (formationType & FormationMask.Body) propertyDescriptors.push(...ATTRS!!.values());

        const dynamo: Item = {};
        for (const propertyDescriptor of propertyDescriptors) {
            const dynamoProperty = this.formationProperty(source, propertyDescriptor);
            Object.assign(dynamo, dynamoProperty);
        }
        return dynamo;
    }

    // Convert dynamoScalar to sourceScalar.
    //
    deformationScalar(value: AttributeValue, dataType: DataType.S | DataType.N | DataType.B | DataType.BOOL): any {
        if (value === undefined || value === undefined) throw new Error(`'${value}' is not allowed.`);
        switch (dataType) {
            case DataType.S:
            case DataType.B:
            case DataType.BOOL:
                return value[dataType];

            case DataType.N:
                return Number(value[dataType]);
        }
    }

    // Convert dynamoList to sourceList.
    //
    deformationList(array: AttributeValue, dataType: DataType.NS | DataType.SS | DataType.BS | DataType.L): any[] {
        switch (dataType) {
            case DataType.SS:
            case DataType.BS: {
                return (array[dataType] as string[]).map((v) => String(v));
            }

            case DataType.NS: {
                return (array[dataType] as string[]).map((v) => Number(v));
            }

            case DataType.L: {
                return (array[dataType] as any[]).map((v) => this.deformation(v));
            }
        }
    }

    // Convert dynamoMap to source.
    //
    deformationMap(dynamo: AttributeValue): any {
        return this.deformation(dynamo.M!!);
    }

    // Convert dynamoProperty to sourceProperty.
    //
    deformationProperty(parent: Item, propertyDescriptor: PropertyDescriptor<any>): any {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data: any): any {
            return {
                [sourcePropertyName]: data
            };
        }

        // Deserialize dynamoProperty.
        const deserialized: Item | any = fetchFromChunkOrValue<any>(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });

        // Return deformationed.
        if (deserialized.S) return resolve(this.deformationScalar(deserialized, DataType.S));
        if (deserialized.N) return resolve(this.deformationScalar(deserialized, DataType.N));
        if (deserialized.B) return resolve(this.deformationScalar(deserialized, DataType.B));
        if (deserialized.SS) return resolve(this.deformationList(deserialized, DataType.SS));
        if (deserialized.NS) return resolve(this.deformationList(deserialized, DataType.NS));
        if (deserialized.BS) return resolve(this.deformationList(deserialized, DataType.BS));
        if (deserialized.L) return resolve(this.deformationList(deserialized, DataType.L));
        if (deserialized.M) return resolve(this.deformationMap(deserialized));
        if (deserialized.BOOL) return resolve(this.deformationScalar(deserialized, DataType.BOOL));
        if (deserialized.NULL) return resolve(undefined);
        return deserialized;
    }

    // Convert dynamoItem to sourceObject.
    //
    deformation(dynamo: Item, TClass: any = MetaData.getTClassByDynamoItem(dynamo)): any {
        // Check if, object is empty.
        if (dynamo === undefined) {
            throw new Error(`Empty object is not allowed`);
        }

        // Validation check.
        // Is it registered in the metadata?
        const holder = new TClass();
        const entityDescriptor: EntityDescriptor<any> = MetaData.getEntityDescriptorByHolder(holder);

        // Gets all field descriptor to create the Object.
        const propertyDescriptors: PropertyDescriptor<any>[] = [];
        if (entityDescriptor.hash) propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.range) propertyDescriptors.push(entityDescriptor.range);
        if (entityDescriptor.attrs) propertyDescriptors.push(...entityDescriptor.attrs.values());

        // Then deformation and merge all fields.
        for (const propertyDescriptor of propertyDescriptors) {
            const sourceProperty = this.deformationProperty(dynamo, propertyDescriptor);
            Object.assign(holder, sourceProperty);
        }
        return holder;
    }
}

const tynamoFormation = new TynamoFormation();
export default tynamoFormation;
