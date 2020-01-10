# Tynamo

Tynamo is ORM based dynamo-mapper and ETL support library. Internally uses [reflect-metadata](https://github.com/rbuckton/reflect-metadata).

It helps you use DynamoDB without deviating from the AWS-SDK usage.

Check [here](https://aerocode.gitbook.io/tynamo/) for more information.

## Sample code

```ts
import { Mapper, DynamoEntity, DynamoProperty, Tynamo, TynamoTable } from "tynamo";

// Define model.
//
@DynamoEntity()
export class Cat {
    @DynamoProperty({ keyType: KeyType.hash })
    id: number;

    @DynamoProperty({ keyType: KeyType.attr })
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

// Usage.
//
async function main() {
    // Get connection.
    const tynamo = new Tynamo({
        region: "...",
        endpoint: "http://localhost:8000"
    });

    // Get conceptual table.
    const catTable = tynamo.getTableOf(Cat);

    await catTable.createTable();
    await catTable.putItem({
        Item: new Cat(666, "garfield"),
        ConditionExpression: "attribute_not_exists(#id)"
    });
    await catTable.deleteTable();
}
main();
```
