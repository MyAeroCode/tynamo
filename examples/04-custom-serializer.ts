import { Fieldtype, DynamoField, Datatype, DynamoFormation, Item, SerializerArg, DeserializerArg, FormationMask, Serializer, Deserializer } from "dynamo-formation";

export function test() {
    const CustomSerializer: Serializer<Entity> = (arg: SerializerArg<Entity>): any => {
        const a = arg.source.key_a;
        const b = arg.source.key_b;
        return [a, b].join("_");
    };

    const CustomDeserializer: Deserializer<Entity> = (arg: DeserializerArg): Partial<Entity> => {
        const tokens: string[] = arg.dynamo.compositKey.S!!.split("_");
        return {
            key_a: tokens[0],
            key_b: tokens[1]
        };
    };

    class Entity {
        @DynamoField(Fieldtype.hash, {
            datatype: Datatype.S,
            serializer: CustomSerializer,
            deserializer: CustomDeserializer
        })
        compositKey!: string;

        key_a!: string;
        key_b!: string;
        key_c!: string;
    }

    const entity: Entity = Object.assign(new Entity(), {
        key_a: "ABC",
        key_b: "XYZ"
    });

    const dynamoItem: Item = DynamoFormation.formation(entity, FormationMask.Full);
    const objectItem: Entity = DynamoFormation.deformation(dynamoItem, Entity);
    console.log(JSON.stringify(dynamoItem, null, 4));
    console.log(JSON.stringify(objectItem, null, 4));
}
