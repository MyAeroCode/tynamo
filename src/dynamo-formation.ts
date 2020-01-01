import { FormationMask, Item, PropertyDescriptor, DataType, EntityDescriptor } from "./type";
import MetaData from "./metadata";
import { fetchFromChunkOrValue } from "./utils";

// Performs the interconversion between DynamoItem and the object.
//
class DynamoFormation {
    // Convert sourceScalar to dynamoScalar.
    //
    formationScalar(value: number | string | boolean): string | boolean {
        if (value === undefined || value === null || value === "") throw new Error(`'${value}' is not allowed.`);
        if (value.constructor === Number) return (value as number).toString();
        if (value.constructor === String) return value as string;
        if (value.constructor === Boolean) return value as boolean;
        throw new Error(`Please specify dataType of non-scalar data.`);
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

        // scalar check.
        if (realDataType === DataType.__SCALAR__) {
            if (source.constructor === Number) realDataType = propertyDescriptor.dataType = DataType.N;
            else if (source.constructor === String) realDataType = propertyDescriptor.dataType = DataType.S;
            else if (source.constructor === Boolean) realDataType = propertyDescriptor.dataType = DataType.BOOL;
            else {
                throw new Error(
                    `Please specify dataType of non-scalar data. -> [${propertyDescriptor.TClassName}.${propertyDescriptor.dynamoPropertyName}]`
                );
            }
        }

        function resolve(value: any): Item {
            return {
                [dynamoPropertyName]: {
                    [realDataType]: value
                }
            };
        }
        switch (realDataType) {
            case DataType.S:
            case DataType.N:
            case DataType.B:
            case DataType.BOOL:
                return resolve(this.formationScalar(source));

            case DataType.SS:
            case DataType.NS:
            case DataType.BS:
                return resolve((source as any[]).map((v) => this.formationScalar(v)));

            case DataType.L:
                return resolve(
                    (source as any[]).map((v) => {
                        try {
                            return this.formation(v);
                        } catch (e) {
                            throw new Error(`DataType.L should not contain scalar values.`);
                        }
                    })
                );

            case DataType.M:
                return resolve(this.formation(source));

            case DataType.NULL:
                return resolve(true);

            default:
                throw new Error(`Can not detect DataType.`);
        }
    }

    // Convert sourceObject to dynamoItem.
    //
    formation<TSource>(source: TSource | undefined, formationType: FormationMask = FormationMask.Full): Item {
        if (source === undefined || source === null) {
            throw new Error(`Empty object is not allowd.`);
        }

        const entityDescriptor: EntityDescriptor<TSource> = MetaData.getOf(source);
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

    // Convert dynamoProperty to sourceProperty.
    //
    deformationProperty(parent: Item, propertyDescriptor: PropertyDescriptor<any>): any {
        const sourcePropertyName = propertyDescriptor.sourcePropertyName;
        function resolve(data: any): any {
            return {
                [sourcePropertyName]: data
            };
        }

        // deserializer
        const property = fetchFromChunkOrValue<any>(propertyDescriptor.deserializer, {
            dynamo: parent,
            propertyDescriptor
        });

        if (property.S) return resolve(String(property.S));
        if (property.N) return resolve(Number(property.N));
        if (property.B) return resolve(String(property.B));
        if (property.SS) return resolve(property.SS as string[]);
        if (property.NS) return resolve((property.NS as string[]).map((nstr) => Number(nstr)));
        if (property.BS) return resolve(property.BS as string[]);
        if (property.L) return resolve((property.L as any[]).map((val) => this.deformation(val)));
        if (property.M) return resolve(this.deformation(property.M));
        if (property.BOOL) return resolve(property.BOOL as boolean);
        if (property.NULL) return resolve(undefined);
        return property;
    }

    // Convert dynamoItem to sourceObject.
    //
    deformation(dynamo: Item, TClass: any = MetaData.getTClassOf(dynamo)): any {
        // Validation check.
        // Is it registered in the metadata?
        const holder = new TClass();
        const entityDescriptor: EntityDescriptor<any> = MetaData.getOf(holder);

        // Gets all field descriptor to create the Object.
        // Then deserialize and merge all fields.
        const propertyDescriptors: PropertyDescriptor<any>[] = [];
        if (entityDescriptor.hash) propertyDescriptors.push(entityDescriptor.hash);
        if (entityDescriptor.range) propertyDescriptors.push(entityDescriptor.range);
        if (entityDescriptor.attrs) propertyDescriptors.push(...entityDescriptor.attrs.values());

        for (const propertyDescriptor of propertyDescriptors) {
            const sourceProperty = this.deformationProperty(dynamo, propertyDescriptor);
            Object.assign(holder, sourceProperty);
        }
        return holder;
    }
}

const dynamoFormation = new DynamoFormation();
export default dynamoFormation;
