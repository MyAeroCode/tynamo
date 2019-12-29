import {
    FormationMask,
    Item,
    FieldDescriptor,
    Datatype,
    TableDescriptor,
    DatatypeArg,
    SerializerArg,
    DeserializerArg
} from "./type";
import Metadata from "./metadata";
import { fetchFromChunkOrValue, convertToDynamoPrimitive, convertToJsPrimitive, defaultSerializer } from "./utils";

// Performs the interconversion between DynamoItem and the object.
//
class DynamoFormation {
    // Converts to DynamoItem.
    //
    formation<TObject>(object: TObject, formationType: FormationMask = FormationMask.Full): Item {
        // Primitive check.
        const classType = (object as Object).constructor;
        if (classType === String) {
            return {
                S: object
            };
        }
        if (classType === Number) {
            return {
                N: (object as any).toString()
            };
        }
        if (classType === Boolean) {
            return {
                BOOL: object
            };
        }

        // Validation check.
        // Is it registered in the metadata?
        const table: TableDescriptor<TObject> = Metadata.getOf(object);

        // Gets all field descriptor to create the DynamoItem.
        // Then serialize and merge all fields.
        const fields: FieldDescriptor<TObject>[] = [];
        if (formationType & FormationMask.HashKey && table.hash) fields.push(table.hash);
        if (formationType & FormationMask.RangeKey && table.range) fields.push(table.range);
        if (formationType & FormationMask.Body) fields.push(...table.attrs!!.values());

        const dynamoItem: Item = {};
        for (const target of fields) {
            // fetch from chunk or value.
            const dynamoPropertyName = target.dynamoPropertyName;
            const objectPropertyName = target.objectPropertyName;
            const datatypeArg: DatatypeArg<TObject> = {
                source: object,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = fetchFromChunkOrValue<Datatype>(target.datatype, datatypeArg);
            const serializerArg: SerializerArg<TObject> = {
                source: object,
                sourcePropertyName: objectPropertyName
            };
            const serialized = fetchFromChunkOrValue<any>(target.serializer, serializerArg);
            const dynamoPrimitive = convertToDynamoPrimitive(serialized, dynamoDatatype);

            // merge.
            const dynamoField: Item =
                dynamoDatatype == Datatype.INJECT
                    ? dynamoPrimitive
                    : {
                          [dynamoPropertyName]: {
                              [dynamoDatatype]: dynamoPrimitive
                          }
                      };

            let realPropertyName: string = "";
            for (const key in dynamoField) {
                realPropertyName = key;
            }
            if (dynamoItem[realPropertyName] != undefined) {
                throw new Error(
                    `Duplicate name while doing INJECT. [${(object as any).constructor.name}.${realPropertyName}]`
                );
            }
            Object.assign(dynamoItem, dynamoField);
        }
        return dynamoItem;
    }

    // Convert to object.
    //
    deformation<TObject>(dynamo: Item, classObject: any, context?: DeserializerArg): TObject {
        // Primitive check.
        if (context && context.dynamoDatatype != Datatype.INJECT) {
            const value = dynamo[context.dynamoPropertyName][context.dynamoDatatype];
            return convertToJsPrimitive(value, context.dynamoDatatype);
        }
        if (dynamo.S) return convertToJsPrimitive(dynamo.S, Datatype.S);
        if (dynamo.N) return convertToJsPrimitive(dynamo.N, Datatype.N);
        if (dynamo.B) return convertToJsPrimitive(dynamo.B, Datatype.B);
        if (dynamo.SS) return convertToJsPrimitive(dynamo.SS, Datatype.SS);
        if (dynamo.NS) return convertToJsPrimitive(dynamo.NS, Datatype.NS);
        if (dynamo.BS) return convertToJsPrimitive(dynamo.BS, Datatype.BS);
        if (dynamo.M) return convertToJsPrimitive(dynamo.M, Datatype.M);
        if (dynamo.L) return convertToJsPrimitive(dynamo.L, Datatype.L);
        if (dynamo.NULL) return convertToJsPrimitive(dynamo.NULL, Datatype.NULL);
        if (dynamo.BOOL) return convertToJsPrimitive(dynamo.BOOL, Datatype.BOOL);

        // Validation check.
        // Is it registered in the metadata?
        const holder = new classObject();
        const table: TableDescriptor<TObject> = Metadata.getOf(holder);

        // Gets all field descriptor to create the Object.
        // Then deserialize and merge all fields.
        const targets: FieldDescriptor<TObject>[] = [];
        if (table.hash) targets.push(table.hash);
        if (table.range) targets.push(table.range);
        if (table.attrs) targets.push(...table.attrs.values());

        for (const target of targets) {
            // fetch from chunk or value.
            const dynamoPropertyName = target.dynamoPropertyName;
            const objectPropertyName = target.objectPropertyName;
            const datatypeArg: DatatypeArg<TObject> = {
                source: holder,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = fetchFromChunkOrValue<Datatype>(target.datatype, datatypeArg);
            const deserializerArg: DeserializerArg = {
                object: classObject,
                dynamo: dynamo,
                dynamoDatatype: dynamoDatatype,
                dynamoPropertyName: dynamoPropertyName,
                sourcePropertyName: objectPropertyName
            };
            const nextClassObject = Reflect.getMetadata("design:type", holder, objectPropertyName);

            // merge.
            if (target.serializer !== defaultSerializer) {
                const deserialized = fetchFromChunkOrValue<any>(target.deserializer, deserializerArg);

                Object.assign(holder, deserialized);
            } else {
                const injectedClass = this.deformation(dynamo, nextClassObject, deserializerArg);
                const objectField: object = {
                    [objectPropertyName]: injectedClass
                };
                Object.assign(holder, objectField);
            }
        }
        return holder;
    }
}

const dynamoFormation = new DynamoFormation();
export default dynamoFormation;
