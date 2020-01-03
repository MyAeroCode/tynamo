import { TynamoFormation } from "../index";
import chai from "chai";

describe("[#12] error-06", () => {
    it("deformate undefined.", () => {
        chai.assert.throws(() => {
            TynamoFormation.deformation(undefined as any);
        });
    });

    it("deformate null.", () => {
        chai.assert.throws(() => {
            TynamoFormation.deformation(null as any);
        });
    });

    it("deformate number.", () => {
        chai.assert.throws(() => {
            TynamoFormation.deformation(777 as any);
        });
    });

    it("deformate string.", () => {
        chai.assert.throws(() => {
            TynamoFormation.deformation("Hello, World!" as any);
        });
    });

    it("deformate boolean.", () => {
        chai.assert.throws(() => {
            TynamoFormation.deformation(true as any);
        });
    });
});
