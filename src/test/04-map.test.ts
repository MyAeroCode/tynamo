import { DynamoEntity, DynamoProperty, PropertyType, DataType, TynamoFormation, Item } from "../index";
import { deepEqual, strictEqual } from "assert";

describe("[#04] map", () => {
    @DynamoEntity
    class Test04_Data {
        @DynamoProperty(PropertyType.hash)
        str!: string;

        @DynamoProperty(PropertyType.attr)
        num!: number;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.M,
            nullable: true
        })
        recursive?: Test04_Data;
    }

    @DynamoEntity
    class Test04_Entity {
        @DynamoProperty(PropertyType.hash)
        str!: string;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.M
        })
        map!: Test04_Data;
    }

    const level_3: Test04_Data = Object.assign(new Test04_Data(), {
        str: "4",
        num: "5",
        recursive: undefined
    });
    const level_2: Test04_Data = Object.assign(new Test04_Data(), {
        str: "2",
        num: 3,
        recursive: level_3
    });
    const entity: Test04_Entity = Object.assign(new Test04_Entity(), {
        str: "1",
        map: level_2
    });

    let dynamoItem: Item;
    let entityItem: Test04_Entity;
    it("formation", () => {
        dynamoItem = TynamoFormation.formation(entity);
        deepEqual(
            dynamoItem,
            {
                str: { S: "1" },
                map: {
                    M: {
                        str: { S: "2" },
                        num: { N: "3" },
                        recursive: {
                            M: {
                                str: { S: "4" },
                                num: { N: "5" },
                                recursive: { NULL: true }
                            }
                        }
                    }
                }
            },
            "-"
        );
    });

    it("deformation", () => {
        entityItem = TynamoFormation.deformation(dynamoItem);
        deepEqual(entityItem, entity, "-");
        strictEqual(entityItem.map.constructor, Test04_Data);
        strictEqual(entityItem.map.recursive!!.constructor, Test04_Data);
        strictEqual(entityItem.constructor, Test04_Entity);
    });
});
