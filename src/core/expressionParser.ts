import { AttributeMap } from "aws-sdk/clients/dynamodbstreams";
import { Mapper } from "..";

class ExpressionParser {
    /**
     * Gets the list of names of the tokens used in the expression.
     *
     * For example,
     *      parseExpressionArgument(":a #x :b #y", ":") => ["a", "b"]
     *      parseExpressionArgument(":a #x :b #y", "#") => ["x", "y"]
     */
    parseExpressionArgument(expression: string, prefix: string): string[] {
        const pattern: string = `${prefix}[a-zA-Z0-9_]+`;
        const regex: RegExp = new RegExp(pattern, "g");
        let arr: string[] = Array.from(expression.matchAll(regex)).map((v) => v[0].substr(prefix.length));
        return arr;
    }

    /**
     * Returns ExpressionAttributeNames.
     */
    getExpressionAttributeNames(
        expression: string,
        item: AttributeMap,
        givenNames?: AWS.DynamoDB.ExpressionAttributeNameMap
    ): AWS.DynamoDB.ExpressionAttributeNameMap | undefined {
        const names: string[] = this.parseExpressionArgument(expression, "#");

        let ans: AWS.DynamoDB.ExpressionAttributeNameMap | undefined;
        if (names.length) {
            ans = {};
            for (const name of names) {
                // If find in GivenNames.
                if (givenNames && givenNames[`#${name}`]) {
                    if (!ans) ans = {};
                    ans[`#${name}`] = givenNames[`#${name}`];
                }
                // If find in Item.
                else if (item[name]) {
                    if (!ans) ans = {};
                    ans[`#${name}`] = name;
                }
            }
        }

        return ans;
    }

    /**
     * Returns ExpressionAttributeValues.
     */
    getExpressionAttributeValues(
        expression: string,
        valueItem?: any | undefined
    ): AWS.DynamoDB.ExpressionAttributeValueMap | undefined {
        const values: string[] = this.parseExpressionArgument(expression, ":");
        let ans: AWS.DynamoDB.ExpressionAttributeValueMap | undefined;

        // Assign values.
        if (values.length) {
            if (!valueItem) {
                throw new Error(`No value was given.`);
            }
            const formationedValues: AttributeMap = Mapper.formation(valueItem, valueItem.constructor);
            for (const value of values) {
                if (formationedValues && formationedValues[value]) {
                    // If find in values.
                    if (!ans) ans = {};
                    ans[`:${value}`] = formationedValues[value];
                }
            }
        }

        return ans;
    }
}
export default new ExpressionParser();
