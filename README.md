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
It will be formationed as below,
and this can be used as a parameter that requires AttributeMap.
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
#### Entity conflict

### Defien dynamo property
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

