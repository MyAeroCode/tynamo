import { TynamoPutItemInput, TynamoGetItemInput, TynamoGetItemOutput, TynamoPutItemOutput, TynamoDeleteItemInput, TynamoDeleteItemOutput, TynamoUpdateItemInput, TynamoUpdateItemOutput, TynamoScanOutput, TynamoScanInput, ClassCapture, TynamoQueryInput, TynamoQueryOutput } from "./type";
import { CreateTableOutput, DeleteTableOutput, DescribeTableOutput } from "aws-sdk/clients/dynamodb";
import AWS from "aws-sdk";
export default class Tynamo {
    /**
     * DynamoDB Connection.
     */
    private connection;
    constructor(options?: AWS.DynamoDB.ClientConfiguration);
    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    createTable<TSource>(TClass: ClassCapture<TSource>): Promise<CreateTableOutput>;
    /**
     * Get information of table corresponding given class.
     */
    describeTable<TSource>(TClass: ClassCapture<TSource>): Promise<DescribeTableOutput>;
    /**
     * Delete table corresponding given class.
     */
    deleteTable<TSource>(TClass: ClassCapture<TSource>): Promise<DeleteTableOutput>;
    /**
     * Put item with conditional expression.
     */
    putItem<TSource>(tnmInput: TynamoPutItemInput<TSource>): Promise<TynamoPutItemOutput<TSource>>;
    /**
     * Put item with projection expression.
     */
    getItem<TSource>(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>>;
    /**
     * Delete item with conditional expression.
     */
    deleteItem<TSource>(tnmInput: TynamoDeleteItemInput<TSource>): Promise<TynamoDeleteItemOutput<TSource>>;
    updateItem<TSource>(tnmInput: TynamoUpdateItemInput<TSource>): Promise<TynamoUpdateItemOutput<TSource>>;
    /**
     * Scan table with filter, projection expressions.
     */
    scan<TSource>(TClass: ClassCapture<TSource>, tnmInput?: TynamoScanInput<TSource>): Promise<TynamoScanOutput<TSource>>;
    /**
     * Query table with filter, projection expressions.
     */
    query<TSource>(TClass: ClassCapture<TSource>, tnmInput: TynamoQueryInput<TSource>): Promise<TynamoQueryOutput<TSource>>;
}
//# sourceMappingURL=tynamo.d.ts.map