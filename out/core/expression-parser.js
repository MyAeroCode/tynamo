"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class ExpressionParser {
    /**
     * Gets the list of names of the tokens used in the expression.
     *
     * For example,
     *      parseExpressionArgument(":a #x :b #y", ":") => ["a", "b"]
     *      parseExpressionArgument(":a #x :b #y", "#") => ["x", "y"]
     */
    parseExpressionArgument(expression, prefix) {
        const pattern = `${prefix}[a-zA-Z0-9_]+`;
        const regex = new RegExp(pattern, "g");
        let arr = Array.from(expression.matchAll(regex)).map((v) => v[0].substr(prefix.length));
        return arr;
    }
    /**
     * Returns ExpressionAttributeNames.
     */
    getExpressionAttributeNames(TClass, expressions, givenNames) {
        const propertyName = __1.MetaData.getAllPropertyNamesByTClass(TClass);
        const errorOn = [];
        const usedNames = this.parseExpressionArgument(expressions.join(";"), "#");
        let ans;
        if (usedNames.length) {
            ans = {};
            for (const usedName of usedNames) {
                // Found on GivenNames.
                if (givenNames && givenNames[`#${usedName}`]) {
                    if (!propertyName.has(givenNames[`#${usedName}`])) {
                        errorOn.push(usedName);
                    }
                    else {
                        if (!ans)
                            ans = {};
                        ans[`#${usedName}`] = givenNames[`#${usedName}`];
                    }
                }
                // Found on Entity.
                else if (propertyName.has(usedName)) {
                    if (!ans)
                        ans = {};
                    ans[`#${usedName}`] = usedName;
                }
                // No found.
                else {
                    errorOn.push(usedName);
                }
            }
        }
        if (errorOn.length) {
            throw new Error(`No such property[${errorOn.join(", ")}] on [${TClass.name}]`);
        }
        return ans;
    }
    /**
     * Returns ExpressionAttributeValues.
     */
    getExpressionAttributeValues(expressions, valueItem) {
        const values = this.parseExpressionArgument(expressions.join(";"), ":");
        const errorOn = [];
        let ans;
        // Assign values.
        if (values.length) {
            if (!valueItem)
                throw new Error(`No value was given.`);
            if (valueItem.constructor === Object) {
                throw new Error(`ExpressionAttributeValues must created by constructor.`);
            }
            const formationedValues = __1.Mapper.formation(valueItem, valueItem.constructor);
            for (const value of values) {
                if (formationedValues && formationedValues[value]) {
                    // If find in values.
                    if (!ans)
                        ans = {};
                    ans[`:${value}`] = formationedValues[value];
                }
                else {
                    // Not find.
                    errorOn.push(`:${value}`);
                }
            }
        }
        // Check if there are any elements that have not been found.
        if (errorOn.length) {
            throw new Error(`Can not find attributeValue -> [${errorOn.join(", ")}]`);
        }
        return ans;
    }
    getFilteredExpressionSet(TClass, expressionSet) {
        const filteredExpressionSet = {};
        // Get unabeld expressions.
        const unabledExpressions = [];
        if (expressionSet.ConditionExpression) {
            filteredExpressionSet.ConditionExpression = expressionSet.ConditionExpression;
            unabledExpressions.push(expressionSet.ConditionExpression);
        }
        if (expressionSet.FilterExpression) {
            filteredExpressionSet.FilterExpression = expressionSet.FilterExpression;
            unabledExpressions.push(expressionSet.FilterExpression);
        }
        if (expressionSet.ProjectionExpression) {
            filteredExpressionSet.ProjectionExpression = expressionSet.ProjectionExpression;
            unabledExpressions.push(expressionSet.ProjectionExpression);
        }
        if (expressionSet.UpdateExpression) {
            filteredExpressionSet.UpdateExpression = expressionSet.UpdateExpression;
            unabledExpressions.push(expressionSet.UpdateExpression);
        }
        if (expressionSet.KeyConditionExpression) {
            filteredExpressionSet.KeyConditionExpression = expressionSet.KeyConditionExpression;
            unabledExpressions.push(expressionSet.KeyConditionExpression);
        }
        // Parse names and values.
        if (unabledExpressions.length) {
            filteredExpressionSet.ExpressionAttributeNames = this.getExpressionAttributeNames(TClass, unabledExpressions, expressionSet.ExpressionAttributeNames);
            filteredExpressionSet.ExpressionAttributeValues = this.getExpressionAttributeValues(unabledExpressions, expressionSet.ExpressionAttributeValues);
        }
        return filteredExpressionSet;
    }
}
exports.default = new ExpressionParser();
//# sourceMappingURL=expression-parser.js.map