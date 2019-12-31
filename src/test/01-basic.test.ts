import { DynamoProperty, PropertyType, DataType, DynamoFormation, Item, DynamoEntity } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("[#01] basic", () => {
    @DynamoEntity
    class Test01_Entity {
        @DynamoProperty(PropertyType.hash)
        num!: number;

        @DynamoProperty(PropertyType.attr)
        str!: string;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.B
        })
        bin!: string;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.NS
        })
        numarr!: number[];

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.SS
        })
        strarr!: number[];

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.BS
        })
        binarr!: number[];

        @DynamoProperty(PropertyType.attr)
        bool!: boolean;
    }
    const entity: Test01_Entity = Object.assign(new Test01_Entity(), {
        num: 1,
        str: "2",
        bin: "3",
        numarr: [4, 5],
        strarr: ["6", "7"],
        binarr: ["8", "9", "10"],
        bool: true
    });

    let dynamoItem: Item;
    let entityItem: Test01_Entity;
    it("formation", () => {
        dynamoItem = DynamoFormation.formation(entity);
        deepEqual(
            dynamoItem,
            {
                num: { N: "1" },
                str: { S: "2" },
                bin: { B: "3" },
                numarr: { NS: ["4", "5"] },
                strarr: { SS: ["6", "7"] },
                binarr: { BS: ["8", "9", "10"] },
                bool: { BOOL: true }
            },
            "-"
        );
    });

    it("deformation", () => {
        entityItem = DynamoFormation.deformation(dynamoItem);
        deepEqual(entityItem, entity, "-");
        strictEqual(entityItem.num.constructor, Number);
        strictEqual(entityItem.str.constructor, String);
        strictEqual(entityItem.bin.constructor, String);
        strictEqual(entityItem.numarr.constructor, Array);
        strictEqual(entityItem.strarr.constructor, Array);
        strictEqual(entityItem.binarr.constructor, Array);
        strictEqual(entityItem.bool.constructor, Boolean);
        strictEqual(entityItem.constructor, Test01_Entity);
    });
});
