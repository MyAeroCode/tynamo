import { TynamoPutItemInput, TynamoGetItemInput, TynamoGetItemOutput, TynamoPutItemOutput } from "./type";
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
    createTable(TClass: any): Promise<CreateTableOutput>;
    /**
     * Get information of table corresponding given class.
     */
    describeTable(TClass: any): Promise<DescribeTableOutput>;
    /**
     * Delete table corresponding given class.
     */
    deleteTable(TClass: any): Promise<DeleteTableOutput>;
    /**
     * Put item with conditional expression.
     */
    putItem<TSource>(tnmInput: TynamoPutItemInput<TSource>): Promise<TynamoPutItemOutput<TSource>>;
    /**
     * Put item with projection expression.
     */
    getItem<TSource>(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>>;
}
//# sourceMappingURL=tynamo.d.ts.map