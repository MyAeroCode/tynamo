import { TynamoExpressionInput, TynamoExpressionOutput, ClassCapture } from "./type";
declare class ExpressionParser {
    /**
     * Gets the list of names of the tokens used in the expression.
     *
     * For example,
     *      parseExpressionArgument(":a #x :b #y", ":") => ["a", "b"]
     *      parseExpressionArgument(":a #x :b #y", "#") => ["x", "y"]
     */
    parseExpressionArgument(expression: string, prefix: string): string[];
    /**
     * Returns ExpressionAttributeNames.
     */
    getExpressionAttributeNames<TSource>(TClass: ClassCapture<TSource>, expressions: string[], givenNames?: AWS.DynamoDB.ExpressionAttributeNameMap | undefined): AWS.DynamoDB.ExpressionAttributeNameMap | undefined;
    /**
     * Returns ExpressionAttributeValues.
     */
    getExpressionAttributeValues(expressions: string[], valueItem: any | undefined): AWS.DynamoDB.ExpressionAttributeValueMap | undefined;
    getFilteredExpressionSet<TSource>(TClass: ClassCapture<TSource>, expressionSet: TynamoExpressionInput): TynamoExpressionOutput;
}
declare const _default: ExpressionParser;
export default _default;
//# sourceMappingURL=expression-parser.d.ts.map