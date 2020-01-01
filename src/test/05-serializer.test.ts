import { DynamoEntity, DynamoProperty, PropertyType, TynamoFormation, Item, Serializer, Deserializer } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("[#05] serializer", () => {
    const mySerializer: Serializer<Test05_Entity> = (arg) => {
        const entity: Test05_Entity = arg.source;
        return [entity.x, entity.y].join("_");
    };
    const myDeserializer: Deserializer<Test05_Entity> = (arg) => {
        const token: string[] = arg.dynamo.str.S!!.split("_");
        return {
            x: token[0],
            y: token[1]
        };
    };

    @DynamoEntity
    class Test05_Entity {
        @DynamoProperty(PropertyType.hash, {
            serializer: mySerializer,
            deserializer: myDeserializer
        })
        str!: string;

        x!: string;
        y!: string;
    }

    const entity: Test05_Entity = Object.assign(new Test05_Entity(), {
        x: "a",
        y: "b"
    });

    let dynamoItem: Item;
    let entityItem: Test05_Entity;
    it("formation", () => {
        dynamoItem = TynamoFormation.formation(entity);
        deepEqual(
            dynamoItem,
            {
                str: { S: "a_b" }
            },
            "-"
        );
    });

    it("deformation", () => {
        entityItem = TynamoFormation.deformation(dynamoItem);
        deepEqual(entityItem, entity, "-");
        strictEqual(entityItem.constructor, Test05_Entity);
    });
});
