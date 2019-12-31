import { DynamoProperty, PropertyType, DataType, DynamoFormation, Item, DynamoEntity } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("[#03] nullable-02", () => {
    @DynamoEntity
    class Test03_Entity {
        @DynamoProperty(PropertyType.hash)
        num!: number;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.B,
            nullable: true
        })
        bin!: string;
    }

    const entity: Test03_Entity = Object.assign(new Test03_Entity(), {
        num: 1
    });

    let dynamoItem: Item;
    let entityItem: Test03_Entity;
    it("formation", () => {
        dynamoItem = DynamoFormation.formation(entity);
        deepEqual(
            dynamoItem,
            {
                num: { N: "1" },
                bin: { NULL: true }
            },
            "-"
        );
    });

    it("deformation", () => {
        entityItem = DynamoFormation.deformation(dynamoItem);
        deepEqual(
            entityItem,
            {
                num: 1,
                bin: undefined
            },
            "-"
        );
        strictEqual(entityItem.constructor, Test03_Entity);
    });
});
