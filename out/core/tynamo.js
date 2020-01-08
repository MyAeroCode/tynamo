"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const tynamo_table_1 = require("./tynamo-table");
class Tynamo {
    constructor(options) {
        this.connection = new aws_sdk_1.default.DynamoDB(options);
    }
    getTableOf(TClass) {
        return new tynamo_table_1.TynamoTable(TClass, this.connection);
    }
}
exports.default = Tynamo;
//# sourceMappingURL=tynamo.js.map