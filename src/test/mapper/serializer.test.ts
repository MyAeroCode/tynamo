import { DynamoEntity, DynamoProperty, Mapper } from "../../index";
import { deepEqual, strictEqual, deepStrictEqual } from "assert";
import { KeyType, Serializer, Deserializer } from "../../core/type";
import { AttributeMap } from "aws-sdk/clients/dynamodbstreams";

describe("serializer/deserializer", () => {
    const mySerializer: Serializer<Entity> = (arg) => {
        const entity: Entity = arg.source;
        return [entity.x, entity.y].join("_");
    };
    const myDeserializer: Deserializer<Entity> = (arg) => {
        const token: string[] = arg.dynamo.str.S!!.split("_");
        return {
            x: token[0],
            y: token[1]
        };
    };

    @DynamoEntity()
    class Entity {
        @DynamoProperty({
            keyType: KeyType.hash,
            serializer: mySerializer,
            deserializer: myDeserializer
        })
        str!: string;

        x!: string;
        y!: string;
    }

    const entity: Entity = Object.assign(new Entity(), {
        x: "a",
        y: "b"
    });

    let dynamoItem: AttributeMap;
    let recover: Entity;
    it("formation", () => {
        dynamoItem = Mapper.formation(entity, Entity);
        deepEqual(
            dynamoItem,
            {
                str: { S: "a_b" }
            },
            "-"
        );
    });

    it("deformation", () => {
        recover = Mapper.deformation(dynamoItem, Entity);
        deepStrictEqual(recover, entity);
    });
});