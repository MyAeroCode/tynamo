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
    getExpressionAttributeNames(expressions: string[], givenNames?: AWS.DynamoDB.ExpressionAttributeNameMap): AWS.DynamoDB.ExpressionAttributeNameMap | undefined;
    /**
     * Returns ExpressionAttributeValues.
     */
    getExpressionAttributeValues(expressions: string[], valueItem?: any | undefined): AWS.DynamoDB.ExpressionAttributeValueMap | undefined;
}
declare const _default: ExpressionParser;
export default _default;
//# sourceMappingURL=expressionParser.d.ts.map