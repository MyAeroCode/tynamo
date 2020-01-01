import { DynamoEntity, DynamoProperty, PropertyType, DynamoFormation, Item, Serializer, Deserializer } from "../index";
import chai from "chai";
import { strictEqual, deepEqual, deepStrictEqual } from "assert";
import { DataType } from "../type";

describe("[#10] complex-01", () => {
    @DynamoEntity
    class ComplexData {
        @DynamoProperty(PropertyType.hash)
        name: string;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.M,
            nullable: true
        })
        data1?: ComplexData;

        @DynamoProperty(PropertyType.attr, {
            dataType: DataType.M,
            nullable: true
        })
        data2?: ComplexData;

        constructor(name: string, data1?: ComplexData, data2?: ComplexData) {
            this.name = name;
            this.data1 = data1;
            this.data2 = data2;
        }
    }

    const entity: ComplexData = new ComplexData(
        "Hello",
        undefined,
        new ComplexData("THERE", new ComplexData("!!"), undefined)
    );
    let dynamoItem: Item;

    it("complex formation.", () => {
        dynamoItem = DynamoFormation.formation(entity);
        deepEqual(dynamoItem, {
            name: { S: "Hello" },
            data1: { NULL: true },
            data2: {
                M: {
                    name: { S: "THERE" },
                    data1: {
                        M: {
                            name: { S: "!!" },
                            data1: { NULL: true },
                            data2: { NULL: true }
                        }
                    },
                    data2: { NULL: true }
                }
            }
        });
    });

    it("complex deformation.", () => {
        deepStrictEqual(entity, DynamoFormation.deformation(dynamoItem));
    });
});
