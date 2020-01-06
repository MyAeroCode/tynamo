import { DynamoProperty, Type, Mapper, DynamoEntity } from "../index";
import { deepEqual, deepStrictEqual } from "assert";
import { KeyType, DataType } from "../core/type";
import { AttributeMap } from "aws-sdk/clients/dynamodbstreams";

describe("basic formation/deformation", () => {
    // TestCase 01
    // S
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash })
            str!: string;
        }
        const source: Entity = Object.assign(new Entity(), { str: "Hello" });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("S -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    str: { S: "Hello" }
                },
                "-"
            );
        });

        it("S -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 02
    // N
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash })
            num!: number;
        }
        const source: Entity = Object.assign(new Entity(), { num: 1 });
        let dynamo: AttributeMap;
        let recover: Entity;
        it("N -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    num: { N: "1" }
                },
                "-"
            );
        });

        it("N -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 03
    // B
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.B })
            binary!: string;
        }
        const source: Entity = Object.assign(new Entity(), { binary: "This is binary" });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("B -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    binary: { B: "This is binary" }
                },
                "-"
            );
        });

        it("B -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 04
    // BOOL
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash })
            bool!: boolean;
        }
        const source: Entity = Object.assign(new Entity(), { bool: true });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("BOOL -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    bool: { BOOL: true }
                },
                "-"
            );
        });

        it("BOOL -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 05
    // SS
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.SS })
            strarr!: string[];
        }
        const source: Entity = Object.assign(new Entity(), { strarr: ["H", "e", "e"] });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("SS -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    strarr: { SS: ["H", "e", "e"] }
                },
                "-"
            );
        });

        it("SS -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 06
    // NS
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.NS })
            numarr!: number[];
        }
        const source: Entity = Object.assign(new Entity(), { numarr: [2, 3, 4] });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("NS -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    numarr: { NS: ["2", "3", "4"] }
                },
                "-"
            );
        });

        it("NS -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 07
    // BS
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.BS })
            binaryarr!: number[];
        }
        const source: Entity = Object.assign(new Entity(), { binaryarr: ["x", "y", "z"] });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("BS -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    binaryarr: { BS: ["x", "y", "z"] }
                },
                "-"
            );
        });

        it("BS -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 08
    // M
    {
        @DynamoEntity()
        class Data {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.S })
            str!: string;
        }

        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.S })
            str!: string;

            @DynamoProperty({ keyType: KeyType.attr, dataType: DataType.M })
            dat!: Data;
        }
        const source: Entity = Object.assign(new Entity(), {
            str: "outer",
            dat: Object.assign(new Data(), {
                str: "inner"
            })
        });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("M -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    str: {
                        S: "outer"
                    },
                    dat: {
                        M: {
                            str: {
                                S: "inner"
                            }
                        }
                    }
                },
                "-"
            );
        });

        it("M -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }

    // TestCase 09
    // L
    {
        @DynamoEntity()
        class Data {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.S })
            str!: string;
        }

        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash, dataType: DataType.S })
            str!: string;

            @DynamoProperty({ keyType: KeyType.attr, dataType: DataType.L, sourceDataType: Data })
            dat!: Data[];
        }
        const source: Entity = Object.assign(new Entity(), {
            str: "outer",
            dat: [Object.assign(new Data(), { str: "aa" }), Object.assign(new Data(), { str: "bb" })]
        });
        let dynamo: AttributeMap;
        let recover: Entity;

        it("L -> formation", () => {
            dynamo = Mapper.formation(source, Entity);
            deepEqual(
                dynamo,
                {
                    str: {
                        S: "outer"
                    },
                    dat: {
                        L: [
                            {
                                str: {
                                    S: "aa"
                                }
                            },
                            {
                                str: {
                                    S: "bb"
                                }
                            }
                        ]
                    }
                },
                "-"
            );
        });

        it("L -> deformation", () => {
            recover = Mapper.deformation(dynamo, Entity);
            deepStrictEqual(recover, source);
        });
    }
});
