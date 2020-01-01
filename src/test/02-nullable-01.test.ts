import { DynamoProperty, PropertyType, DataType, TynamoFormation, Item, DynamoEntity } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("[#02] nullable-01", () => {
    @DynamoEntity
    class Test02_Entity {
        @DynamoProperty(PropertyType.hash)
        num!: number;

        @DynamoProperty(PropertyType.attr)
        str!: string;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.B,
            nullable: true
        })
        bin!: string;
    }

    const entity: Test02_Entity = Object.assign(new Test02_Entity(), {
        num: 1,
        str: "2",
        bin: undefined
    });

    let dynamoItem: Item;
    let entityItem: Test02_Entity;
    it("formation", () => {
        dynamoItem = TynamoFormation.formation(entity);
        deepEqual(
            dynamoItem,
            {
                num: { N: "1" },
                str: { S: "2" },
                bin: { NULL: true }
            },
            "-"
        );
    });

    it("deformation", () => {
        entityItem = TynamoFormation.deformation(dynamoItem);
        deepEqual(entityItem, entity, "-");
        strictEqual(entityItem.constructor, Test02_Entity);
    });
});
