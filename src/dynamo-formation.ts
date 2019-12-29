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
import { fetchFromChunkOrValue, convertToDynamoPrimitive, convertToJsPrimitive } from "./utils";

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
            const dynamoPropertyName = fetchFromChunkOrValue<string>(target.dynamoPropertyName, undefined);
            const objectPropertyName = fetchFromChunkOrValue<string>(target.objectPropertyName, undefined);
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
                dynamoDatatype == Datatype.NESTED
                    ? {
                          [dynamoPropertyName]: dynamoPrimitive
                      }
                    : {
                          [dynamoPropertyName]: {
                              [dynamoDatatype]: dynamoPrimitive
                          }
                      };
            Object.assign(dynamoItem, dynamoField);
        }
        return dynamoItem;
    }

    // Convert to object.
    //
    deformation<TObject>(dynamo: Item, classObject?: any): TObject {
        // Primitive check.
        if (dynamo.N) return Number.parseFloat(dynamo.N as string) as any; // it must number.
        if (dynamo.S) return dynamo.S as any; // it must string.
        if (dynamo.BOOL) return dynamo.BOOL as any; // it must boolean.

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
            const dynamoPropertyName = fetchFromChunkOrValue<string>(target.dynamoPropertyName, undefined);
            const objectPropertyName = fetchFromChunkOrValue<string>(target.objectPropertyName, undefined);
            const datatypeArg: DatatypeArg<TObject> = {
                source: holder,
                sourcePropertyName: objectPropertyName
            };
            const dynamoDatatype = fetchFromChunkOrValue<Datatype>(target.datatype, datatypeArg);
            const deserializerArg: DeserializerArg = {
                dynamo: dynamo,
                dynamoDatatype: dynamoDatatype,
                dynamoPropertyName: dynamoPropertyName,
                sourcePropertyName: objectPropertyName
            };
            const deserialized = fetchFromChunkOrValue<any>(target.deserializer, deserializerArg);
            const nextClassObject = Reflect.getMetadata("design:type", holder, objectPropertyName);
            const jsPrimitive = convertToJsPrimitive(deserialized, dynamoDatatype, nextClassObject);

            // merge.
            const objectField: object = {
                [objectPropertyName]: jsPrimitive
            };
            Object.assign(holder, objectField);
        }
        return holder;
    }
}

const dynamoFormation = new DynamoFormation();
export default dynamoFormation;
