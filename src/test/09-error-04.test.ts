import { DynamoEntity, DynamoProperty, PropertyType, TynamoFormation, Item, Serializer, Deserializer } from "../index";
import chai from "chai";

describe("[#09] error-04", () => {
    @DynamoEntity
    class AttrUndefined {
        @DynamoProperty(PropertyType.hash)
        ___a!: string;

        @DynamoProperty(PropertyType.attr)
        ___b!: string;
    }

    it("When Non-nullable Attr is not given.", () => {
        chai.assert.throws(() => {
            const entity: AttrUndefined = Object.assign(new AttrUndefined(), {
                ___a: "Hello"
            });
            TynamoFormation.formation(entity);
        });
    });

    it("When Non-nullable Attr is undefined.", () => {
        chai.assert.throws(() => {
            const entity: AttrUndefined = Object.assign(new AttrUndefined(), {
                ___a: "Hello",
                ___b: undefined
            });
            TynamoFormation.formation(entity);
        });
    });

    it("When Non-nullable Attr is null.", () => {
        chai.assert.throws(() => {
            const entity: AttrUndefined = Object.assign(new AttrUndefined(), {
                ___a: "Hello",
                ___b: null
            });
            TynamoFormation.formation(entity);
        });
    });

    it("When Non-nullable Attr is empty string.", () => {
        chai.assert.throws(() => {
            const entity: AttrUndefined = Object.assign(new AttrUndefined(), {
                ___a: "Hello",
                ___b: ""
            });
            TynamoFormation.formation(entity);
        });
    });

    it("When Non-nullable Attr is not empty string.", () => {
        const entity: AttrUndefined = Object.assign(new AttrUndefined(), {
            ___a: "Hello",
            ___b: "H"
        });
        TynamoFormation.formation(entity);
    });
});
