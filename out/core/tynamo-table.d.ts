import { ClassCapture, TynamoPutItemInput, TynamoPutItemOutput, TynamoGetItemInput, TynamoGetItemOutput, TynamoDeleteItemInput, TynamoDeleteItemOutput, TynamoUpdateItemInput, TynamoUpdateItemOutput, TynamoScanInput, TynamoScanOutput, TynamoQueryInput, TynamoQueryOutput, TynamoBatchGetItemInput, TynamoBatchGetItemOutput, TynamoBatchWriteItemInput, TynamoBatchWriteItemOutput } from "./type";
import { CreateTableOutput, DescribeTableOutput, DeleteTableOutput } from "aws-sdk/clients/dynamodb";
export declare class TynamoTable<TSource> {
    private TClass;
    private connection;
    constructor(TClass: ClassCapture<TSource>, connection: AWS.DynamoDB);
    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    createTable(): Promise<CreateTableOutput>;
    /**
     * Get information of table corresponding given class.
     */
    describeTable(): Promise<DescribeTableOutput>;
    /**
     * Delete table corresponding given class.
     */
    deleteTable(): Promise<DeleteTableOutput>;
    /**
     * Put item with conditional expression.
     */
    putItem(tnmInput: TynamoPutItemInput<TSource>): Promise<TynamoPutItemOutput<TSource>>;
    /**
     * Put item with projection expression.
     */
    getItem(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>>;
    /**
     * Delete item with conditional expression.
     */
    deleteItem(tnmInput: TynamoDeleteItemInput<TSource>): Promise<TynamoDeleteItemOutput<TSource>>;
    updateItem(tnmInput: TynamoUpdateItemInput<TSource>): Promise<TynamoUpdateItemOutput<TSource>>;
    /**
     * Scan table with filter, projection expressions.
     */
    scan(tnmInput?: TynamoScanInput<TSource>): Promise<TynamoScanOutput<TSource>>;
    /**
     * Query table with filter, projection expressions.
     */
    query(tnmInput: TynamoQueryInput<TSource>): Promise<TynamoQueryOutput<TSource>>;
    private __batchGet;
    private __batchWrite;
    batchGetItem(tnmInput: TynamoBatchGetItemInput<TSource>): Promise<TynamoBatchGetItemOutput<TSource>>;
    batchWriteItem(tnmInput: TynamoBatchWriteItemInput<TSource>): Promise<TynamoBatchWriteItemOutput<TSource>>;
}
//# sourceMappingURL=tynamo-table.d.ts.map