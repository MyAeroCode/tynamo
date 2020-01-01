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
        + Property type
        + Data type
        + Custom serializer
        + Custom deserializer
    + Mapping
        + Formation
        + Deformation
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

#### Entity conflict
In some cases, the two entity of Signature may be the same. This is called `confliction`.  If confliction occurs, the deformation is not performed normally and an error occurs. The following information is used to evaluate Singature:
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
Because the above two Entities have the same Signature, When trying to deformation, the following error occurs:
```
Error: Entity structure conflict. -> [Cat, Human]
    at MetaData.getTClassByDynamo
    at TynamoFormation.deformation
    at ...
```


### Define dynamo property


#### Property type
#### Data type
#### Custom serializer
#### Custom deserializer

### Mapping
#### Formation
#### Deformation

### Using with DynamoDB(AWS-SDK)
#### putItem
#### getItem

