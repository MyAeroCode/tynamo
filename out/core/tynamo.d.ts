import AWS from "aws-sdk";
import { ClassCapture } from "./type";
import { TynamoTable } from "./tynamo-table";
export default class Tynamo {
    private connection;
    constructor(options?: AWS.DynamoDB.ClientConfiguration);
    getTableOf<TSource>(TClass: ClassCapture<TSource>): TynamoTable<TSource>;
}
//# sourceMappingURL=tynamo.d.ts.map