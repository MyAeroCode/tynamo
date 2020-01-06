import { DynamoEntity, DynamoProperty, Mapper } from "../index";
import { deepEqual, deepStrictEqual } from "assert";
import { DataType, KeyType } from "../core/type";
import { AttributeMap } from "aws-sdk/clients/dynamodbstreams";

describe("complex Model : Tree", () => {
    @DynamoEntity()
    class Node {
        @DynamoProperty({
            keyType: KeyType.hash,
            dataType: DataType.S
        })
        name: string;

        @DynamoProperty({
            keyType: KeyType.attr,
            dataType: DataType.M,
            nullable: true
        })
        left?: Node;

        @DynamoProperty({
            keyType: KeyType.attr,
            dataType: DataType.M,
            nullable: true
        })
        right?: Node;

        constructor(name: string, data1?: Node, data2?: Node) {
            this.name = name;
            this.left = data1;
            this.right = data2;
        }
    }

    const root: Node = new Node("Hello", new Node("L", undefined, undefined), new Node("R", new Node("!!"), undefined));
    let dynamo: AttributeMap;

    it("tree 01 -> formation.", () => {
        dynamo = Mapper.formation(root, Node);
        deepEqual(dynamo, {
            name: { S: "Hello" },
            left: {
                M: {
                    name: { S: "L" },
                    left: { NULL: true },
                    right: { NULL: true }
                }
            },
            right: {
                M: {
                    name: { S: "R" },
                    left: {
                        M: {
                            name: { S: "!!" },
                            left: { NULL: true },
                            right: { NULL: true }
                        }
                    },
                    right: { NULL: true }
                }
            }
        });
    });

    it("tree 01 -> deformation", () => {
        deepStrictEqual(root, Mapper.deformation(dynamo, Node));
    });
});
