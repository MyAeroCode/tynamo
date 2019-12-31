import { DynamoEntity, DynamoProperty, PropertyType, DynamoFormation, Item, Serializer, Deserializer } from "../index";
import chai from "chai";

describe("[#06] error-01", () => {
    @DynamoEntity
    class Test06_Entity {
        @DynamoProperty(PropertyType.hash)
        emptyHashKey!: string;
    }

    it("When value of HashKey is not given.", () => {
        const entity: Test06_Entity = Object.assign(new Test06_Entity());
        chai.assert.throws(() => DynamoFormation.formation(entity));
    });

    it("When value of HashKey is undefined.", () => {
        const entity: Test06_Entity = Object.assign(new Test06_Entity(), {
            emptyHashKey: undefined
        });
        chai.assert.throws(() => DynamoFormation.formation(entity));
    });

    it("When value of HashKey is null.", () => {
        const entity: Test06_Entity = Object.assign(new Test06_Entity(), {
            emptyHashKey: null
        });
        chai.assert.throws(() => DynamoFormation.formation(entity));
    });

    it("When value of HashKey is empty string.", () => {
        const entity: Test06_Entity = Object.assign(new Test06_Entity(), {
            emptyHashKey: ""
        });
        chai.assert.throws(() => DynamoFormation.formation(entity));
    });
});
