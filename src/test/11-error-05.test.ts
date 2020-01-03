import { TynamoFormation } from "../index";
import chai from "chai";

describe("[#11] error-05", () => {
    it("formate undefined.", () => {
        chai.assert.throws(() => {
            TynamoFormation.formation(undefined);
        });
    });

    it("formate null.", () => {
        chai.assert.throws(() => {
            TynamoFormation.formation(null);
        });
    });

    it("formate number.", () => {
        chai.assert.throws(() => {
            TynamoFormation.formation(777);
        });
    });

    it("formate string.", () => {
        chai.assert.throws(() => {
            TynamoFormation.formation("Hello, World!");
        });
    });

    it("formate boolean.", () => {
        chai.assert.throws(() => {
            TynamoFormation.formation(true);
        });
    });
});
