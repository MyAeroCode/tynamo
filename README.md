# tynamo

Tynamo is ORM based dynamo-mapper and ETL support library. Internally uses [reflect-metadata](https://github.com/rbuckton/reflect-metadata).

It helps you use DynamoDB without deviating from the AWS-SDK usage.

For example,

```ts
import { Mapper, DynamoEntity, DynamoProperty } from "tynamo";

@DynamoEntity
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
const badCat = new Cat(666, "garfield");
const formationResult = Mapper.formation(badCat, Cat);
```

`badCat` will be formationed as below,

```json
{
    "id": {
        "N": "666"
    },
    "name": {
        "S": "garfield"
    }
}
```

and this can be used as a parameter that requires `AttributeMap`.

```ts
import AWS from "aws-sdk";
import { Mapper } from "tynamo";
import { Cat } from "./cat";

const connection = new AWS.DynamoDB({
    region: "...",
    endpoint: "http://localhost:8000"
});

const result = await connection
    .putItem({
        TableName: "Cat",
        Item: Mapper.formation(new Cat(666, "garfield"), Cat)
    })
    .promise();
```

Or you can use `TynamoTable`. This is similar to Dynamo, but provides an easier interface.

```ts
...
import { Tynamo, TynamoTable } from "tynamo";
import { Cat } from "./cat"

const tynamo: Tynamo = new Tynamo({
    region: "...",
    endpoint: "http://localhost:8000"
});
const catTable: TynamoTable<Cat> = tynamo.getTableOf(Cat);

await catTable.createTable();
await catTable.putItem({
    // TableName: "Cat",   <<  There is no need to write it down.
    Item: new Cat(666, "garfield")
});
await catTable.deleteTable();
```

Check [here](https://aerocode.gitbook.io/tynamo/) for more information.
