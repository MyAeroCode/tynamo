import { FormationType, Item, FieldDescriptor, DataType, TableDescriptor, Maybe } from "./type";
import Metadata from "./metadata";
import { fetchFromChunkOrValue } from "./utils";

// Performs the interconversion between DynamoItem and the object.
//
class DynamoFormation {
    // Converts to DynamoItem.
    //
    formation<TObject>(object: TObject, formationType: FormationType = FormationType.Full): Item {
        // Validation check.
        // Is it registered in the metadata?
        const table: Maybe<TableDescriptor<TObject>> = Metadata.getOf(object);
        if (!table) throw new Error(`Unregistered entity [${(object as Object).constructor.name}]`);

        // Gets all field descriptor to create the DynamoItem.
        // Then serialize and merge all fields.
        const fields: FieldDescriptor<TObject>[] = [];
        if (formationType & FormationType.HashKey && table.hash) fields.push(table.hash);
        if (formationType & FormationType.RangeKey && table.range) fields.push(table.range);
        if (formationType & FormationType.Body) fields.push(...table.attrs!!.values());

        const dynamoItem: Item = {};
        for (const target of fields) {
            // fetch from chunk or value.
            let dynamoDatatypeName = fetchFromChunkOrValue<DataType>(target.dynamoDatatypeName, undefined);
            let dynamoPropertyName = fetchFromChunkOrValue<string>(target.dynamoPropertyName, undefined);
            let objectPropertyName = fetchFromChunkOrValue<string>(target.objectPropertyName, undefined);
            let serialized = fetchFromChunkOrValue<Item>(target.serializer, {
                object: object,
                objectPropertyName: objectPropertyName
            });

            // merge.
            let item: Item = {
                [dynamoPropertyName]: {
                    [dynamoDatatypeName]: serialized
                }
            };
            Object.assign(dynamoItem, item);
        }
        return dynamoItem;
    }

    // Convert to object.
    //
    deformation<TObject>(dynamo: Item, classObject: any): TObject {
        // Validation check.
        // Is it registered in the metadata?
        let holder = new classObject();
        const table : Maybe<TableDescriptor<any>> = Metadata.getOf(holder);
        if(table == undefined) throw new Error(`Unregistered entity [${(holder as Object).constructor.name}]`);

        // Gets all field descriptor to create the Object.
        // Then deserialize and merge all fields.
        const targets: FieldDescriptor<TObject>[] = [];
        if (table.hash) targets.push(table.hash);
        if (table.range) targets.push(table.range);
        if (table.attrs) targets.push(...table.attrs.values());

        for (const target of targets) {
            // fetch from chunk or value.
            let dynamoPropertyName = fetchFromChunkOrValue(target.dynamoPropertyName, undefined);
            let dynamoDatatypeName = fetchFromChunkOrValue(target.dynamoDatatypeName, undefined);
            let objectPropertyName = fetchFromChunkOrValue(target.objectPropertyName, undefined);
            let deserialized = fetchFromChunkOrValue(target.deserializer, {
                dynamo: dynamo,
                dynamoPropertyName: dynamoPropertyName,
                dynamoDatatypeName: dynamoDatatypeName,
                objectPropertyName: objectPropertyName
            });

            // merge.
            Object.assign(holder, deserialized);
        }
        return holder;
    }
}

const dynamoFormation = new DynamoFormation();
export default dynamoFormation;
