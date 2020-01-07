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
    getExpressionAttributeNames(expression, item, givenNames) {
        const names = this.parseExpressionArgument(expression, "#");
        let ans;
        if (names.length) {
            ans = {};
            for (const name of names) {
                // If find in GivenNames.
                if (givenNames && givenNames[`#${name}`]) {
                    if (!ans)
                        ans = {};
                    ans[`#${name}`] = givenNames[`#${name}`];
                }
                // If find in Item.
                else if (item[name]) {
                    if (!ans)
                        ans = {};
                    ans[`#${name}`] = name;
                }
            }
        }
        return ans;
    }
    /**
     * Returns ExpressionAttributeValues.
     */
    getExpressionAttributeValues(expression, valueItem) {
        const values = this.parseExpressionArgument(expression, ":");
        let ans;
        // Assign values.
        if (values.length) {
            if (!valueItem) {
                throw new Error(`No value was given.`);
            }
            const formationedValues = __1.Mapper.formation(valueItem, valueItem.constructor);
            for (const value of values) {
                if (formationedValues && formationedValues[value]) {
                    // If find in values.
                    if (!ans)
                        ans = {};
                    ans[`:${value}`] = formationedValues[value];
                }
            }
        }
        return ans;
    }
}
exports.default = new ExpressionParser();
//# sourceMappingURL=expressionParser.js.map