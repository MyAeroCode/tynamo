import { DynamoEntity, DynamoProperty, PropertyType, TynamoFormation, Item, Serializer, Deserializer } from "../index";
import chai from "chai";

describe("[#08] error-03", () => {
    it("When HashKey is duplicated.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedHashKey {
                @DynamoProperty(PropertyType.hash)
                __a!: string;

                @DynamoProperty(PropertyType.hash)
                __b!: string;
            }
        });
    });

    it("When RangeKey is duplicated.", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedRangeKey {
                @DynamoProperty(PropertyType.hash)
                __c!: string;

                @DynamoProperty(PropertyType.hash)
                __d!: string;
            }
        });
    });

    it("When PropertyName is duplicated. (1)", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedAttrName1 {
                @DynamoProperty(PropertyType.hash, {
                    propertyName: "A"
                })
                __e!: string;

                @DynamoProperty(PropertyType.attr, {
                    propertyName: "A"
                })
                __f!: string;
            }
        });
    });

    it("When PropertyName is duplicated. (2)", () => {
        chai.assert.throws(() => {
            @DynamoEntity
            class DuplicatedAttrName2 {
                @DynamoProperty(PropertyType.hash)
                __g!: string;

                @DynamoProperty(PropertyType.attr, {
                    propertyName: "__g"
                })
                __h!: string;
            }
        });
    });
});
