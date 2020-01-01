# tynamo
ORM based dynamo entity mapper. Internally uses [reflect-metadata](https://github.com/rbuckton/reflect-metadata).

It helps you use DynamoDB without deviating from the basic AWS-SDK usage.

For example,
```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
```
It will be formationed as below, and this can be used as a parameter that requires `AttributeMap`.
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

## Table of Contents
+ Installation
+ Usage
    + Define dynamo entity
        + Entity conflict
    + Define dynamo property
        + Nested entity
        + Array of entity
        + Support property type
        + Support property data type
        + Alias
        + Custom serializer
        + Custom deserializer
    + Mapping
        + Formation
        + Formation mask
        + Implicit deformation
        + Explicit deformation
        
    + Using with DynamoDB(AWS-SDK)
        + putItem
        + getItem


## Installation


## Usage
### Define dynamo entity
Write the `@DynamoEntity` decorator on top of the class definition.
```ts
@DynamoEntity
class Cat {
   ...
}
```

### Entity conflict
In some cases, the two entity of Signature may be the same. 

This is called `confliction`.  If confliction occurs, the deformation is not performed normally and an error occurs. 

The following information is used to evaluate Singature:
+ Dynamo property name
+ ~~Dynamo property type~~  (todo)
+ ~~Dynamo property data type~~  (todo)

```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id!: number;

    @DynamoProperty(PropertyType.attr)
    name!: string;
}

@DynamoEntity
class Human {
    @DynamoProperty(PropertyType.hash)
    id!: number;

    @DynamoProperty(PropertyType.attr)
    name!: string;
}
```
Because the above two Entities have the same Signature, 

When trying to deformation, the following error occurs:
```
Error: Entity structure conflict. -> [Cat, Human]
    at MetaData.getTClassByDynamo
    at TynamoFormation.deformation
    at ...
```
***
### Define dynamo property
Write the `@DynamoProperty` decorator on top of the class definition.
Only the corresponding Property is added to DynamoItem.

For example,
```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
```
It will be formationed as,
```
{
    "id": {
        "N": "666"
    }
}
```

### Nested entity
Only classes with "@DynamoEntity" be nested with `DataType.M`.

For example,
```ts
@DynamoEntity
class Catnip {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    @DynamoProperty(PropertyType.attr, {
        dataType: DataType.M
    })
    catnip: Catnip;

    constructor(id: number, name: string, catnip: Catnip) {
        this.id = id;
        this.name = name;
        this.catnip = catnip;
    }
}
const badCat = new Cat(666, "garfield", new Catnip(777, "Happy Catnip"));
const dynamoItem: Item = TynamoFormation.formation(badCat);
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
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    @DynamoProperty(PropertyType.attr, {
        dataType: DataType.L
    })
    friends: Cat[];

    constructor(id: number, name: string, friends: Cat[]) {
        this.id = id;
        this.name = name;
        this.friends = friends;
    }
}
```


### Support property type
| PropertyType  | Require                 |
| :-----------: |:-----------------------:|
| hash          | 1                       |
| range         | 0 or 1                  |
| attr          | more than or equal to 0 |


### Support property data type
| DataType  | Require              |
| :-------- |:---------------------|
| N         | number               |
| S         | string               |
| B         | string               |
| NS        | Array<number>        |
| SS        | Array<string>        |
| BS        | Array<string>        |
| BOOL      | boolean              |
| M         | @DynamoEntity        |
| L         | Array<@DynamoEntity> |

### Alias
You can set custom name of the dynamoProperty.

For example,
```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash, {
        propertyName: "number_id"
    })
    __id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    constructor(id: number, name: string) {
        this.__id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
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

### Custom serializer
Custom serializer allows you to combine two or more values that exist in the source.

For example,
```ts
@DynamoEntity
class Entity {
    @DynamoProperty(PropertyType.hash, {
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
const dynamoItem: Item = TynamoFormation.formation(entity);
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
Custom deserializer allows you to revert to the original object based on the value of DynamoItem.

For example,
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

***
### Mapping
You can map the DynamoEntity with a TynamoFormation object.
```ts
import { TynamoFormation } from "tynamo";
```

### Formation
Converts objects created by the constructor of the class declared DynamoEntity to the DynamoDB Item.

Do :
```ts
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
```

Don't:
```ts
const badCat = {
    id: 666,
    name: "garfield"
};
const dynamoItem: Item = TynamoFormation.formation(badCat);
```

### Formation mask
With Mask, only certain information can be included in the DynamoItem.

```ts
export enum FormationMask {
    HashKey  = 0b001,
    RangeKey = 0b010,
    Body     = 0b100,
    KeyOnly  = 0b011,  // == HashKey | RangeKey
    Full     = 0b111   // defualt, == HashKey | RangeKey | Body
}
```

For example,
```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat, FormationMask.KeyOnly);
```
It will be formationed as,
```ts
{
    "id": {
        "N": "666"
    }
}
```

### Implicit deformation
Convert to an object of Entity that has the same signature as a given DynamoItem.
```ts
@DynamoEntity
class Cat {
    @DynamoProperty(PropertyType.hash)
    id: number;

    @DynamoProperty(PropertyType.attr)
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
const sourceItem = TynamoFormation.deformation(dynamoItem);
```
It will be deformationed as object of Cat.
It is same for nested or listed Entities.
```
Cat {id: 666, name: "garfield"}
```


### Explicit deformation
If you want, you can explicitly hand over the type.
There is little difference in performance.
```ts
const badCat = new Cat(666, "garfield");
const dynamoItem: Item = TynamoFormation.formation(badCat);
const sourceItem = TynamoFormation.deformation(dynamoItem, Cat);
```

***
### Using with DynamoDB(AWS-SDK)
### putItem
### getItem

