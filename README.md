# tynamo

ORM based dynamo entity mapper. Internally uses [reflect-metadata](https://github.com/rbuckton/reflect-metadata).

It helps you use DynamoDB without deviating from the basic AWS-SDK usage.

For example,

```ts
import { Mapper, DynamoEntity, DynamoProperty } from "tynamo";

@DynamoEntity
class Cat {
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
const dynamoItem: Item = Mapper.formation(badCat, Cat);
```

It will be formationed as below,

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

const conn = new AWS.DynamoDB({
    region: "...",
    endpoint: "http://localhost:8000"
});

const result = await conn
    .putItem({
        TableName: "Cat",
        Item: Mapper.formation(badCat, Cat)
    })
    .promise();
```

## Table of Contents

-   [Feature](#feature)
-   [Installation](#installation)
-   [Define model](#define-model)
    -   [Define dynamo entity](#define-dynamo-entity)
    -   [Define dynamo property](#define-dynamo-property)
    -   [Alias](#alias)
    -   [Nested entity](#nested-entity)
    -   [Array of entity](#array-of-entity)
    -   [Support property type](#support-property-type)
    -   [Support property data type](#support-property-data-type)
    -   [Custom serializer](#custom-serializer)
    -   [Custom deserializer](#custom-deserializer)
-   [Mapping](#mapping)
    -   [Formation](#formation)
    -   [Formation mask](#formation-mask)
    -   [Deformation](#deformation)
-   [Using with DynamoDB(AWS-SDK)](#user-content-using-with-dynamodbaws-sdk)
    -   [putItem](#putitem)
    -   [getItem](#getitem)

## Feature

It's a recently created ORM. Tynamo don't have many features yet.

Current Feature,

-   [Define model](#define-model)
-   [Mapping](#mapping)

Todo,

-   ETL support.
    -   Put/Get
    -   BatchWrite/BatchGet
    -   Scan
    -   Query
    -   ...
-   Pagination support.
    -   Page Number Based.
    -   Cursor Based.
    -   ...
-   ...

## Installation

npm :

```
npm i tynamo
```

Then enable below parameter on your `tsconfig.json`.

```ts
/* Experimental Options */
"experimentalDecorators": true  /* Enables experimental support for ES7 decorators. */,
"emitDecoratorMetadata" : true  /* Enables experimental support for emitting type metadata for decorators. */,
```

the following import syntax may be required on the top:

```ts
import "reflect-metadata";
```

## Define model

### Define dynamo entity

Write the `@DynamoEntity` decorator on top of the class definition.

```ts
@DynamoEntity
class Cat {
   ...
}
```

### Define dynamo property

Write the `@DynamoProperty` decorator on top of the property definition.
This property will be added to DynamoItem.

For example,

```ts
@DynamoEntity
class Cat {
    @DynamoProperty({ keyType: KeyType.hash })
    id: number;

    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = Mapper.formation(badCat, Cat);
```

It will be formationed as,

```
{
    "id": {
        "N": "666"
    }
}
```

### Alias

You can set custom name of the dynamoProperty.

For example,

```ts
@DynamoEntity
class Cat {
    @DynamoProperty({
        keyType: KeyType.hash,
        propertyName: "number_id"
    })
    id: number;

    @DynamoProperty({ keyType: KeyType.attr })
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = Mapper.formation(badCat, Cat);
```

It will be formationed as,

```
{
    "number_id": {
        "N": "666"
    },
    "name": {
        "S": "garfield"
    }
}
```

### Nested entity

Only classes with "@DynamoEntity" be nested with `DataType.M`.

For example,

```ts
@DynamoEntity
class Catnip {
    @DynamoProperty({ keyType: KeyType.hash })
    id: number;

    @DynamoProperty({ keyType: KeyType.attr })
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

@DynamoEntity
class Cat {
    @DynamoProperty({ keyType: KeyType.hash })
    id: number;

    @DynamoProperty({ keyType: KeyType.attr })
    name: string;

    @DynamoProperty({ keyType: KeyType.attr, dataType: DataType.M })
    catnip: Catnip;

    constructor(id: number, name: string, catnip: Catnip) {
        this.id = id;
        this.name = name;
        this.catnip = catnip;
    }
}
const badCat = new Cat(666, "garfield", new Catnip(777, "Happy Catnip"));
const dynamoItem: Item = Mapper.formation(badCat, Cat);
```

It will be formationed as,

```
{
    "id": {
        "N": "666"
    },
    "name": {
        "S": "garfield"
    },
    "catnip": {
        "M": {
            "id": {
                "N": "777"
            },
            "name": {
                "S": "Happy Catnip"
            }
        }
    }
}
```

### Array of entity

Only classes with "@DynamoEntity" be list-element with `DataType.L`.

```ts
class Cat {
    @DynamoProperty({ keyType: KeyType.hash })
    id: number;

    @DynamoProperty({ keyType: KeyType.attr })
    name: string;

    @DynamoProperty({ keyType: KeyType.attr, dataType: DataType.L })
    friends: Cat[];

    constructor(id: number, name: string, friends: Cat[]) {
        this.id = id;
        this.name = name;
        this.friends = friends;
    }
}
```

### Support property type

| PropertyType |         Require         |
| :----------: | :---------------------: |
|     hash     |            1            |
|    range     |         0 or 1          |
|     attr     | more than or equal to 0 |

### Support property data type

| DataType | Require         |
| :------- | :-------------- |
| N        | number          |
| S        | string          |
| B        | string          |
| NS       | number[]        |
| SS       | string[]        |
| BS       | string[]        |
| BOOL     | boolean         |
| M        | @DynamoEntity   |
| L        | @DynamoEntity[] |

### Custom serializer

You can resolve value of dynamoProperty using by sourceObject.
For example, `alias : id` is resolved to `[x, y].join("_")`
It is good for generate `composite key`.

```ts
@DynamoEntity
class Entity {
    @DynamoProperty({
        keyType: KeyType.hash,
        propertyName: "id",
        serializer: (arg: SerializerArg<Entity>) => {
            const source: Entity = arg.source;
            return [source.x, source.y].join("_");
        }
    })
    __id?: string;

    x: string;
    y: string;

    constructor(x: string, y: string) {
        this.x = x;
        this.y = y;
    }
}
const entity = new Entity("Hello", "World!");
const dynamoItem: Item = Mapper.formation(entity, Entity);
```

It will be formationed as,

```
{
    "id": {
        "S": "Hello_World!"
    }
}
```

### Custom deserializer

Also you can revert using by value of DynamoItem. The `deserializer` returns fragment to return to the original object.
You can have only one Serializer and only one Deserializer in each Property.
All fragments are merged.

```ts
@DynamoEntity
class Entity {
    @DynamoProperty(PropertyType.hash, {
        propertyName: "id",
        serializer: (arg: SerializerArg<Entity>) => {
            const source: Entity = arg.source;
            return [source.x, source.y].join("_");
        },
        deserializer: (arg: DeserializerArg): Partial<Entity> => {
            const token: string[] = arg.dynamo.id.S!!.split("_");
            return {
                x: token[0],
                y: token[1]
            };
        }
    })
    __id?: string;

    x: string;
    y: string;

    constructor(x: string, y: string) {
        this.x = x;
        this.y = y;
    }
}
```

---

## Mapping

You can map(formation or deformation) the DynamoEntity with a Mapper object.

```ts
import { Mapper } from "tynamo";
```

### Formation

Use `formation` method.

```ts
const badCat = new Cat(666, "garfield");
// or
const badCat = { id: 666, name: "garfield" };

const dynamoItem: Item = Mapper.formation(badCat, Cat);
```

### Formation mask

With Mask, only certain information can be included in the DynamoItem. It is good for generate key.

```ts
export enum FormationMask {
    HashKey = 0b001,
    RangeKey = 0b010,
    Body = 0b100,
    KeyOnly = 0b011, // == HashKey | RangeKey
    Full = 0b111 // defualt, == HashKey | RangeKey | Body
}

const dynamoItemKey: Item = Mapper.formation(badCat, Cat, FormationMask.KeyOnly);
```

### deformation

Use `deformation` method. Below example will returns `Cat {id:666, name:"garfield}` object.

```ts
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = Mapper.formation(badCat);
const sourceItem = Mapper.deformation(dynamoItem, Cat);
```

---

### Using with DynamoDB(AWS-SDK)

In fact, `Item` type is an alias of `AttributeMap`.

Therefore, Item type can be used where AttributeMap is required.

### putItem

```ts
const badCat = new Cat(666, "garfield");
const conn = new AWS.DynamoDB({
    region: "...",
    endpoint: "http://localhost:8000"
});
const result = await conn
    .putItem({
        TableName: "Cat",
        Item: Mapper.formation(badCat, Cat)
    })
    .promise();
```

### getItem

```ts
const badCat = new Cat(666, "garfield");
const conn = new AWS.DynamoDB({
    region: "...",
    endpoint: "http://localhost:8000"
});
await conn
    .getItem({
        TableName: "Cat",
        Key: Mapper.formation(badCat, FormationMask.KeyOnly)
    })
    .promise()
    .then((response) => {
        Mapper.deformation(response.Item, Cat);
        ...
    });
```
