import { DynamoProperty, KeyType, DataType, TynamoFormation, Item, DynamoEntity } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("nullable", () => {
    @DynamoEntity
    class Entity {
        @DynamoProperty({
            keyType: KeyType.hash
        })
        num!: number;

        @DynamoProperty({
            keyType: KeyType.attr,
            dataType: DataType.B,
            nullable: true
        })
        bin!: string;
    }

    let dynamoItem: Item;
    let recover: Entity;

    // TestCase 01
    // bin is undefined.
    {
        const entity: Entity = Object.assign(new Entity(), {
            num: 1,
            bin: undefined
        });
        it("is undefined -> formation", () => {
            dynamoItem = TynamoFormation.formation(entity, Entity);
            deepEqual(
                dynamoItem,
                {
                    num: { N: "1" },
                    bin: { NULL: true }
                },
                "-"
            );
        });
        it("is undefined -> deformation", () => {
            recover = TynamoFormation.deformation(dynamoItem, Entity);
            deepEqual(recover, entity, "-");
            strictEqual(recover.constructor, Entity);
        });
    }

    // TestCase 02
    // bin is null
    {
        const entity: Entity = Object.assign(new Entity(), {
            num: 3,
            bin: null
        });
        it("is null -> formation", () => {
            dynamoItem = TynamoFormation.formation(entity, Entity);
            deepEqual(
                dynamoItem,
                {
                    num: { N: "3" },
                    bin: { NULL: true }
                },
                "-"
            );
        });
        it("is null -> deformation", () => {
            recover = TynamoFormation.deformation(dynamoItem, Entity);
            deepEqual(recover, entity, "-");
            strictEqual(recover.constructor, Entity);
        });
    }
});
