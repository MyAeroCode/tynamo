"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const expressionParser_1 = __importDefault(require("./expressionParser"));
const __1 = require("..");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class Tynamo {
    constructor(options) {
        this.connection = new aws_sdk_1.default.DynamoDB(options);
    }
    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    createTable(TClass) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create Key Schema, Key Attr Definitions.
            const keys = __1.MetaData.getKeysByConstructor(TClass);
            const keySchemaDef = [];
            const keyAttrDef = [];
            for (const key of keys) {
                keySchemaDef.push({
                    AttributeName: key.dynamoPropertyName,
                    KeyType: key.dynamoKeyType
                });
                keyAttrDef.push({
                    AttributeName: key.dynamoPropertyName,
                    AttributeType: key.dynamoDataType
                });
            }
            // Create input.
            const input = {
                AttributeDefinitions: keyAttrDef,
                KeySchema: keySchemaDef,
                TableName: ""
            };
            Object.assign(input, tableInfo);
            if (tableInfo.ProvisionedThroughput === undefined) {
                input.ProvisionedThroughput = {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                };
            }
            // Call DynamoDB API.
            return this.connection.createTable(input).promise();
        });
    }
    /**
     * Get information of table corresponding given class.
     */
    describeTable(TClass) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName
            };
            // Call DynamoDB API.
            return this.connection.describeTable(input).promise();
        });
    }
    /**
     * Delete table corresponding given class.
     */
    deleteTable(TClass) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const deleteTableInput = {
                TableName: tableInfo.TableName
            };
            // Call DynamoDB API.
            return this.connection.deleteTable(deleteTableInput).promise();
        });
    }
    /**
     * Put item with conditional expression.
     */
    putItem(tnmInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const TSourceConstructor = tnmInput.Item.constructor;
            const formationedItem = __1.Mapper.formation(tnmInput.Item, TSourceConstructor);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TSourceConstructor);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Item: formationedItem
            };
            if (tnmInput.ReturnItemCollectionMetrics)
                input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.ReturnValues)
                input.ReturnValues = tnmInput.ReturnValues;
            if (tnmInput.ConditionExpression) {
                input.ConditionExpression = tnmInput.ConditionExpression;
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(tnmInput.ConditionExpression, formationedItem, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(tnmInput.ConditionExpression, tnmInput.ValueItem);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.putItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Attributes: result.Attributes ? __1.Mapper.deformation(result.Attributes, TSourceConstructor) : undefined,
                        ConsumedCapacity: result.ConsumedCapacity,
                        ItemCollectionMetrics: result.ItemCollectionMetrics
                    });
                });
            });
        });
    }
    /**
     * Put item with projection expression.
     */
    getItem(tnmInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const TSourceConstructor = tnmInput.Key.constructor;
            const formationedKey = __1.Mapper.formation(tnmInput.Key, TSourceConstructor, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TSourceConstructor);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            if (tnmInput.ConsistentRead)
                input.ConsistentRead = tnmInput.ConsistentRead;
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.ProjectionExpression) {
                input.ProjectionExpression = tnmInput.ProjectionExpression;
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(input.ProjectionExpression, formationedKey, tnmInput.ExpressionAttributeNames);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.getItem(input).promise();
                    resolve({
                        Item: result.Item ? __1.Mapper.deformation(result.Item, TSourceConstructor) : undefined,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
}
exports.default = Tynamo;
//# sourceMappingURL=tynamo.js.map