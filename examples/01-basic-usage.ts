import { Fieldtype, DynamoField, Datatype, DynamoFormation, Item } from "dynamo-formation";

export function test() {
    class Book {
        // Support Datatype.
        //      String -> S (Primitive)
        //      Number -> N (Primitive)
        //      Boolean -> BOOL (Primitive)
        //      Binary -> B
        //      StringSet -> SS
        //      NumberSet -> NS
        //      BinarySet -> BS
        //      Map -> M
        //      List -> L
        //
        // Unsupport
        //      NULL -> NULL
        //
        @DynamoField(Fieldtype.hash)
        title!: string;

        @DynamoField(Fieldtype.range)
        price!: number;

        @DynamoField(Fieldtype.attr)
        isOutOfPrint!: boolean;

        @DynamoField(Fieldtype.attr, {
            datatype: Datatype.SS // Required, cuzz it's Non-Primitive.
        })
        authors!: string[];

        @DynamoField(Fieldtype.attr, {
            datatype: Datatype.NS // Required, cuzz it's Non-Primitive.
        })
        isbn!: number[];
    }

    const book: Book = Object.assign(new Book(), {
        title: "Hello, World!",
        price: 12345,
        isOutOfPrint: false,
        authors: ["Aero", "Code"],
        isbn: [1, 234, 789, 45]
    });
    const dynamoItem: Item = DynamoFormation.formation(book);
    const objectItem: Book = DynamoFormation.deformation(dynamoItem, Book);

    console.log(JSON.stringify(dynamoItem, null, 4));
    console.log(JSON.stringify(objectItem, null, 4));
}
