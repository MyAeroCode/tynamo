import { Fieldtype, DynamoField, Datatype, DynamoFormation, Item } from "dynamo-formation";

export function test() {
    class InnerBox {
        @DynamoField(Fieldtype.hash, {
            datatype: Datatype.N
        })
        value!: number;
    }
    class Box {
        @DynamoField(Fieldtype.hash, {
            datatype: Datatype.S
        })
        title!: string;

        @DynamoField(Fieldtype.attr, {
            datatype: Datatype.NESTED // <- write this.
        })
        inner!: InnerBox;
    }

    const box: Box = Object.assign(new Box(), {
        title: "Hello, World!",
        inner: Object.assign(new InnerBox(), {
            value: 12345
        })
    });
    const dynamoItem: Item = DynamoFormation.formation(box);
    const objectItem: Box = DynamoFormation.deformation(dynamoItem, Box);

    console.log(JSON.stringify(dynamoItem, null, 4));
    console.log(JSON.stringify(objectItem, null, 4));
}
