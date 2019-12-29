import { Fieldtype, DynamoField, Datatype, DynamoFormation, Item, FormationMask } from "dynamo-formation";

export function test() {
    class Entity {
        @DynamoField(Fieldtype.hash, {
            datatype: Datatype.S
        })
        hashKey!: string;

        @DynamoField(Fieldtype.range, {
            datatype: Datatype.S
        })
        rangeKey!: string;

        @DynamoField(Fieldtype.attr, {
            datatype: Datatype.S
        })
        a!: string;

        @DynamoField(Fieldtype.attr, {
            datatype: Datatype.S
        })
        b!: string;
    }

    const entity: Entity = Object.assign(new Entity(), {
        hashKey: "hash",
        rangeKey: "range",
        a: "attr_1",
        b: "attr_2"
    });

    // Using formation mask.
    const dynamoItem: Item = DynamoFormation.formation(entity); // == FormationMask.Full
    const dynamoItemKey: Item = DynamoFormation.formation(entity, FormationMask.KeyOnly);
    const dynamoItemHashKey: Item = DynamoFormation.formation(entity, FormationMask.HashKey);
    const dynamoItemRangeKey: Item = DynamoFormation.formation(entity, FormationMask.RangeKey);
    const dynamoItemBody: Item = DynamoFormation.formation(entity, FormationMask.Body);

    // if you want (body | hashkey).
    const BodyHashMask = FormationMask.Body | FormationMask.HashKey;
    const dynamoItemBodyHash = DynamoFormation.formation(entity, BodyHashMask);
}
