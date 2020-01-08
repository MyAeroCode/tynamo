import { DynamoProperty, DynamoEntity, Tynamo } from "../../index";
import { KeyType } from "../../core/type";

describe("basic operation table", () => {
    const tynamo = new Tynamo({
        region: "ap-northeast-2",
        endpoint: "http://localhost:8000"
    });

    // TestCase 01
    // Create, Describe, Delete Table.
    {
        @DynamoEntity()
        class Entity {
            @DynamoProperty({ keyType: KeyType.hash })
            str!: string;
        }

        it("Create table.", () => {
            tynamo.getTableOf(Entity).createTable();
        });

        it("Describe table", () => {
            tynamo.getTableOf(Entity).describeTable();
        });

        it("Delete table", () => {
            tynamo.getTableOf(Entity).deleteTable();
        });
    }
});
