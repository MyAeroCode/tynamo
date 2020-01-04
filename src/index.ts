import "reflect-metadata";
import { DynamoProperty } from "./decorator/dynamo-property";
import { DynamoEntity } from "./decorator/dynamo-entity";
import TynamoFormation from "./core/tynamo";
import MetaData from "./core/metadata";
import {
    PropertyDecoratorArgs,
    DataType,
    DataTypeResolverArg,
    KeyType,
    Item,
    FormationMask,
    SerializerArg,
    DeserializerArg,
    PropertyDescriptor,
    Serializer,
    Deserializer
} from "./type";
export {
    DynamoEntity,
    DynamoProperty,
    DataTypeResolverArg,
    TynamoFormation,
    MetaData,
    DataType,
    KeyType,
    Item,
    FormationMask,
    Serializer,
    Deserializer,
    SerializerArg,
    DeserializerArg,
    PropertyDecoratorArgs,
    PropertyDescriptor
};

@DynamoEntity
class Entity {
    @DynamoProperty({
        keyType: KeyType.hash,
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
const entity = new Entity("Hello", "World!");
const dynamoItem: Item = TynamoFormation.formation(entity, Entity);
const r = TynamoFormation.deformation(dynamoItem, Entity);
console.log(JSON.stringify(r, null, 4));
