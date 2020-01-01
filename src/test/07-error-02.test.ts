import { DynamoEntity, DynamoProperty, PropertyType, TynamoFormation, Item, Serializer, Deserializer } from "../index";
import chai from "chai";

describe("[#07] error-02", () => {
    it("When DynamoEntity missing.", () => {
        class DynamoEntityMissing {
            @DynamoProperty(PropertyType.hash)
            _a!: string;
        }
        const entity: DynamoEntityMissing = Object.assign(new DynamoEntityMissing(), {
            _a: "Hello"
        });
        chai.assert.throws(() => TynamoFormation.formation(entity));
    });

    it("When HashKey missing.", () => {
        @DynamoEntity
        class HashKeyMissing {
            @DynamoProperty(PropertyType.range)
            _b!: string;
        }
        const entity: HashKeyMissing = Object.assign(new HashKeyMissing(), {
            _b: "Hello"
        });
        chai.assert.throws(() => TynamoFormation.formation(entity));
    });

    it("When HashKey is nullable.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class HashKeyNullable {
                @DynamoProperty(PropertyType.hash, {
                    nullable: true
                })
                _c!: string;
            }
            const entity: HashKeyNullable = Object.assign(new HashKeyNullable(), {
                _c: "Hello"
            });
            TynamoFormation.formation(entity);
        });
    });

    it("When RangeKey is nullable.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class HashKeyMissing {
                @DynamoProperty(PropertyType.hash)
                _d!: string;

                @DynamoProperty(PropertyType.range, {
                    nullable: true
                })
                _e!: string;
            }
            const entity: HashKeyMissing = Object.assign(new HashKeyMissing(), {
                _d: "Hello",
                _e: "Hello"
            });
            TynamoFormation.formation(entity);
        });
    });
});
