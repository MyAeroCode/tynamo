import { DynamoEntity, DynamoProperty, KeyType, Mapper } from "../index";
import chai from "chai";

describe("error", () => {
    @DynamoEntity
    class Entity {
        @DynamoProperty({ keyType: KeyType.hash })
        emptyHashKey!: string;
    }

    it("When value of HashKey is not given.", () => {
        const entity: Entity = Object.assign(new Entity());
        chai.assert.throws(() => Mapper.formation(entity, Entity));
    });

    it("When value of HashKey is undefined.", () => {
        const entity: Entity = Object.assign(new Entity(), {
            emptyHashKey: undefined
        });
        chai.assert.throws(() => Mapper.formation(entity, Entity));
    });

    it("When value of HashKey is null.", () => {
        const entity: Entity = Object.assign(new Entity(), {
            emptyHashKey: null
        });
        chai.assert.throws(() => Mapper.formation(entity, Entity));
    });

    it("When value of HashKey is empty string.", () => {
        const entity: Entity = Object.assign(new Entity(), {
            emptyHashKey: ""
        });
        chai.assert.throws(() => Mapper.formation(entity, Entity));
    });

    it("When HashKey is nullable.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class HashIsNullable {
                @DynamoProperty({ keyType: KeyType.hash, nullable: true })
                id!: number;
            }
        });
    });

    it("When SortKey is nullable.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class SortIsNullable {
                @DynamoProperty({ keyType: KeyType.sort, nullable: true })
                id!: number;
            }
        });
    });

    it("When no HashKey exist", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class OnlySortKey {
                @DynamoProperty({ keyType: KeyType.sort, nullable: true })
                id!: number;
            }
            Mapper.formation({ id: 3 }, OnlySortKey);
        });
    });

    it("When @DynamoEntity is missing", () => {
        chai.assert.throws(() => {
            class DynamoEntityMissing {
                @DynamoProperty({ keyType: KeyType.hash, nullable: true })
                id!: number;
            }
            Mapper.formation({ id: 3 }, DynamoEntityMissing);
        });
    });

    it("When HashKey is duplicated.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedHashKey {
                @DynamoProperty({ keyType: KeyType.hash })
                a!: string;

                @DynamoProperty({ keyType: KeyType.hash })
                b!: string;
            }
        });
    });

    it("When SortKey is duplicated.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedRangeKey {
                @DynamoProperty({ keyType: KeyType.sort })
                a!: string;

                @DynamoProperty({ keyType: KeyType.sort })
                b!: string;
            }
        });
    });

    it("When PropertyName is duplicated. (1)", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedAttrName1 {
                @DynamoProperty({ keyType: KeyType.hash, propertyName: "b" })
                a!: string;

                @DynamoProperty({ keyType: KeyType.attr })
                b!: string;
            }
        });
    });

    it("When PropertyName is duplicated. (2)", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedAttrName2 {
                @DynamoProperty({ keyType: KeyType.hash, propertyName: "c" })
                a!: string;

                @DynamoProperty({ keyType: KeyType.attr, propertyName: "c" })
                b!: string;
            }
        });
    });

    @DynamoEntity
    class Entity2 {
        @DynamoProperty({ keyType: KeyType.hash })
        a!: string;

        @DynamoProperty({ keyType: KeyType.attr })
        b!: string;
    }
    it("When Non-nullable Attr is not given.", () => {
        chai.assert.throws(() => {
            const entity: Entity2 = Object.assign(new Entity2(), {
                a: "Hello"
            });
            Mapper.formation(entity, Entity2);
        });
    });

    it("When Non-nullable Attr is undefined.", () => {
        chai.assert.throws(() => {
            const entity: Entity2 = Object.assign(new Entity2(), {
                a: "Hello",
                b: undefined
            });
            Mapper.formation(entity, Entity2);
        });
    });

    it("When Non-nullable Attr is null.", () => {
        chai.assert.throws(() => {
            const entity: Entity2 = Object.assign(new Entity2(), {
                a: "Hello",
                b: null
            });
            Mapper.formation(entity, Entity2);
        });
    });

    it("When Non-nullable Attr is empty string.", () => {
        chai.assert.throws(() => {
            const entity: Entity2 = Object.assign(new Entity2(), {
                a: "Hello",
                b: ""
            });
            Mapper.formation(entity, Entity2);
        });
    });

    it("When Non-nullable Attr is not empty string.", () => {
        const entity: Entity2 = Object.assign(new Entity2(), {
            a: "Hello",
            b: "H"
        });
        Mapper.formation(entity, Entity2);
    });

    it("formate undefined.", () => {
        chai.assert.throws(() => {
            Mapper.formation(undefined, Entity);
        });
    });

    it("formate null.", () => {
        chai.assert.throws(() => {
            Mapper.formation(null, Entity);
        });
    });

    it("formate number.", () => {
        chai.assert.throws(() => {
            Mapper.formation(777, Entity);
        });
    });

    it("formate string.", () => {
        chai.assert.throws(() => {
            Mapper.formation("Hello, World!", Entity);
        });
    });

    it("formate boolean.", () => {
        chai.assert.throws(() => {
            Mapper.formation(true, Entity);
        });
    });

    it("deformate undefined.", () => {
        chai.assert.throws(() => {
            Mapper.deformation(undefined as any, Entity);
        });
    });

    it("deformate null.", () => {
        chai.assert.throws(() => {
            Mapper.deformation(null as any, Entity);
        });
    });

    it("deformate number.", () => {
        chai.assert.throws(() => {
            Mapper.deformation(777 as any, Entity);
        });
    });

    it("deformate string.", () => {
        chai.assert.throws(() => {
            Mapper.deformation("Hello, World!" as any, Entity);
        });
    });

    it("deformate boolean.", () => {
        chai.assert.throws(() => {
            Mapper.deformation(true as any, Entity);
        });
    });
});
