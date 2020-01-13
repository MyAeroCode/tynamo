import { DynamoProperty, DynamoEntity, Tynamo } from "../../index";
import { KeyType, PutOrDelete } from "../../core/type";
import { deepStrictEqual, equal, deepEqual } from "assert";
import { plainToClass } from "class-transformer";

describe("basic operation item", () => {
    // TestCase 01
    // Put, Get, Update, Delete

    const tynamo = new Tynamo({
        region: "ap-northeast-2",
        endpoint: "http://localhost:8000"
    });

    @DynamoEntity({ TableName: Math.random().toString() })
    class Cat {
        @DynamoProperty({ keyType: KeyType.hash })
        id!: number;

        @DynamoProperty({ keyType: KeyType.sort })
        name!: string;

        @DynamoProperty({ keyType: KeyType.attr })
        age!: number;

        @DynamoProperty({ keyType: KeyType.attr })
        bin!: Buffer;
    }

    const catTable = tynamo.getTableOf(Cat);
    const badCat: Cat = plainToClass(Cat, {
        id: 666,
        name: "garfield",
        age: 3,
        bin: Buffer.from("Hello, World!")
    });

    it("put/get", async () => {
        await catTable.createTable();
        await catTable.putItem({ Item: badCat });
        const r = await catTable.getItem({ Key: badCat });
        await catTable.deleteTable();
        deepStrictEqual(r.Item, badCat);
    });

    it("put/update/get", async () => {
        @DynamoEntity({ TableName: Math.random().toString() })
        class Args {
            @DynamoProperty({ keyType: KeyType.hash })
            age!: number;
        }

        await catTable.createTable();
        await catTable.putItem({ Item: badCat });
        await catTable.updateItem({
            Key: badCat,
            UpdateExpression: "SET #age = :age",
            ExpressionAttributeValues: plainToClass(Args, { age: 22 })
        });
        const r = await catTable.getItem({ Key: badCat });
        await catTable.deleteTable();
        deepStrictEqual(
            r.Item,
            plainToClass(Cat, {
                id: 666,
                name: "garfield",
                age: 22,
                bin: Buffer.from("Hello, World!")
            })
        );
    });

    it("batch write / batch get", async function test() {
        @DynamoEntity({
            TableName: Math.random().toString()
        })
        class Data {
            @DynamoProperty({ keyType: KeyType.hash })
            id!: number;

            @DynamoProperty({ keyType: KeyType.attr })
            name!: string;
        }
        const table = tynamo.getTableOf(Data);
        const data: Data[] = [];
        for (let i = 0; i < 250; i++) {
            data.push(
                plainToClass(Data, {
                    id: i,
                    name: i.toString()
                })
            );
        }
        const putRequests: PutOrDelete<Data>[] = data.map((v) => {
            return {
                Operation: "put",
                Item: v
            };
        });

        await table.createTable();
        await table.batchWriteItem({ RequestItems: putRequests });
        const result = await table.batchGetItem({ RequestItems: data });
        await table.deleteTable();

        // await catTable.deleteTable();
        await equal(result.UnprocessedKeys, undefined);
        await equal(result.Responses!!.length, data.length);
    });

    it("batch write / scan (pagination) ", async function test() {
        @DynamoEntity({
            TableName: Math.random().toString()
        })
        class Data {
            @DynamoProperty({ keyType: KeyType.hash })
            id!: number;

            @DynamoProperty({ keyType: KeyType.attr })
            name!: string;
        }

        const tynamo = new Tynamo({ region: "ap-northeast-2", endpoint: "http://localhost:8000" });
        const table = tynamo.getTableOf(Data);
        const data: Data[] = [];
        for (let i = 0; i < 250; i++) {
            data.push(
                plainToClass(Data, {
                    id: i,
                    name: i.toString()
                })
            );
        }
        const putRequests: PutOrDelete<Data>[] = data.map((v) => {
            return {
                Operation: "put",
                Item: v
            };
        });

        await table.createTable();
        await table.batchWriteItem({ RequestItems: putRequests });
        const step1 = await table.scan({
            Limit: 100
        });
        const step2 = await table.scan({
            Limit: 100,
            ExclusiveStartKey: step1.LastEvaluatedKey
        });
        const step3 = await table.scan({
            Limit: 100,
            ExclusiveStartKey: step2.LastEvaluatedKey
        });
        await table.deleteTable();

        const set = new Set<number>();
        step1.Items!!.forEach((v) => set.add(v.id));
        step2.Items!!.forEach((v) => set.add(v.id));
        step3.Items!!.forEach((v) => set.add(v.id));
        equal(step1.ScannedCount!! + step2.ScannedCount!! + step3.ScannedCount!!, data.length);
        equal(set.size, data.length);
    });

    it("batch write / scan (with conditional expression) ", async function test() {
        @DynamoEntity({
            TableName: Math.random().toString()
        })
        class Data {
            @DynamoProperty({ keyType: KeyType.hash })
            id!: number;

            @DynamoProperty({ keyType: KeyType.attr })
            name!: string;
        }
        @DynamoEntity()
        class Args {
            @DynamoProperty({ keyType: KeyType.hash })
            name!: string;
        }

        const tynamo = new Tynamo({ region: "ap-northeast-2", endpoint: "http://localhost:8000" });
        const table = tynamo.getTableOf(Data);
        const data: Data[] = [];
        for (let i = 0; i < 250; i++) {
            data.push(
                plainToClass(Data, {
                    id: i,
                    name: i.toString()
                })
            );
        }
        const putRequests: PutOrDelete<Data>[] = data.map((v) => {
            return {
                Operation: "put",
                Item: v
            };
        });

        await table.createTable();
        await table.batchWriteItem({ RequestItems: putRequests });
        const result = await table.scan({
            FilterExpression: "begins_with(#name, :name)",
            ExpressionAttributeValues: plainToClass(Args, { name: "14" })
        });
        await table.deleteTable();
        equal(result.Items?.length, 11);
    });
});
