import AWS from "aws-sdk";
import { ClassCapture } from "./type";
import { TynamoTable } from "./tynamo-table";

export default class Tynamo {
    private connection: AWS.DynamoDB;
    constructor(options?: AWS.DynamoDB.ClientConfiguration) {
        this.connection = new AWS.DynamoDB(options);
    }

    getTableOf<TSource>(TClass: ClassCapture<TSource>): TynamoTable<TSource> {
        return new TynamoTable(TClass, this.connection);
    }
}
