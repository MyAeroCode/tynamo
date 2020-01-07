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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check param.
            if (tnmInput.Item.constructor === Object ||
                ((_a = tnmInput.ExpressionAttributeValues) === null || _a === void 0 ? void 0 : _a.constructor) === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const TClass = tnmInput.Item.constructor;
            const formationedItem = __1.Mapper.formation(tnmInput.Item, TClass);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
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
            // Parse expression.
            const exps = [];
            if (tnmInput.ConditionExpression) {
                exps.push(tnmInput.ConditionExpression);
                input.ConditionExpression = tnmInput.ConditionExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(exps, tnmInput.ExpressionAttributeValues);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.putItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Attributes: result.Attributes ? __1.Mapper.deformation(result.Attributes, TClass) : undefined,
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
            // Check param.
            if (tnmInput.Key.constructor === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const TClass = tnmInput.Key.constructor;
            const formationedKey = __1.Mapper.formation(tnmInput.Key, TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            if (tnmInput.ConsistentRead)
                input.ConsistentRead = tnmInput.ConsistentRead;
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            // Parse expression.
            const exps = [];
            if (tnmInput.ProjectionExpression) {
                exps.push(tnmInput.ProjectionExpression);
                input.ProjectionExpression = tnmInput.ProjectionExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.getItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Item: result.Item ? __1.Mapper.deformation(result.Item, TClass) : undefined,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
    /**
     * Delete item with conditional expression.
     */
    deleteItem(tnmInput) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check param.
            if (tnmInput.Key.constructor === Object ||
                ((_a = tnmInput.ExpressionAttributeValues) === null || _a === void 0 ? void 0 : _a.constructor) === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const TClass = tnmInput.Key.constructor;
            const formationedKey = __1.Mapper.formation(tnmInput.Key, TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.ReturnItemCollectionMetrics)
                input.ReturnConsumedCapacity = tnmInput.ReturnItemCollectionMetrics;
            if (tnmInput.ReturnValues)
                input.ReturnValues = tnmInput.ReturnValues;
            // Parse expression.
            const exps = [];
            if (tnmInput.ConditionExpression) {
                exps.push(tnmInput.ConditionExpression);
                input.ConditionExpression = tnmInput.ConditionExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(exps, tnmInput.ExpressionAttributeValues);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.deleteItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Attributes: result.Attributes ? __1.Mapper.deformation(result.Attributes, TClass) : undefined,
                        ConsumedCapacity: result.ConsumedCapacity,
                        ItemCollectionMetrics: result.ItemCollectionMetrics
                    });
                });
            });
        });
    }
    updateItem(tnmInput) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check param.
            if (tnmInput.Key.constructor === Object ||
                ((_a = tnmInput.ExpressionAttributeValues) === null || _a === void 0 ? void 0 : _a.constructor) === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const TClass = tnmInput.Key.constructor;
            const formationedKey = __1.Mapper.formation(tnmInput.Key, TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.ReturnItemCollectionMetrics)
                input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
            if (tnmInput.ReturnValues)
                input.ReturnValues = tnmInput.ReturnValues;
            // Parse expression.
            const exps = [];
            if (tnmInput.ConditionExpression) {
                exps.push(tnmInput.ConditionExpression);
                input.ConditionExpression = tnmInput.ConditionExpression;
            }
            if (tnmInput.UpdateExpression) {
                exps.push(tnmInput.UpdateExpression);
                input.UpdateExpression = tnmInput.UpdateExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(exps, tnmInput.ExpressionAttributeValues);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.updateItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Attributes: result.Attributes ? __1.Mapper.deformation(result.Attributes, TClass) : undefined,
                        ConsumedCapacity: result.ConsumedCapacity,
                        ItemCollectionMetrics: result.ItemCollectionMetrics
                    });
                });
            });
        });
    }
    /**
     * Scan table with filter, projection expressions.
     */
    scan(TClass, tnmInput = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check param.
            if (((_a = tnmInput.ExpressionAttributeValues) === null || _a === void 0 ? void 0 : _a.constructor) === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName
            };
            if (tnmInput.ConsistentRead)
                input.ConsistentRead = tnmInput.ConsistentRead;
            if (tnmInput.ExclusiveStartKey)
                input.ExclusiveStartKey = __1.Mapper.formation(tnmInput.ExclusiveStartKey, TClass);
            if (tnmInput.IndexName)
                input.IndexName = tnmInput.IndexName;
            if (tnmInput.Limit)
                input.Limit = tnmInput.Limit;
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.Segment)
                input.Segment = tnmInput.Segment;
            if (tnmInput.Select)
                input.Select = tnmInput.Select;
            if (tnmInput.TotalSegments)
                input.TotalSegments = tnmInput.TotalSegments;
            // Parse expressions.
            const exps = [];
            if (tnmInput.FilterExpression) {
                exps.push(tnmInput.FilterExpression);
                input.FilterExpression = tnmInput.FilterExpression;
            }
            if (tnmInput.ProjectionExpression) {
                exps.push(tnmInput.ProjectionExpression);
                input.ProjectionExpression = tnmInput.ProjectionExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(exps, tnmInput.ExpressionAttributeValues);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.scan(input).promise();
                    resolve({
                        $response: result.$response,
                        Items: result.Items ? result.Items.map((v) => __1.Mapper.deformation(v, TClass)) : result.Items,
                        Count: result.Count,
                        ScannedCount: result.ScannedCount,
                        LastEvaluatedKey: result.LastEvaluatedKey
                            ? __1.Mapper.deformation(result.LastEvaluatedKey, TClass)
                            : result.LastEvaluatedKey,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
    /**
     * Query table with filter, projection expressions.
     */
    query(TClass, tnmInput) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check param.
            if (((_a = tnmInput.ExpressionAttributeValues) === null || _a === void 0 ? void 0 : _a.constructor) === Object) {
                throw new Error(`Must use constructor`);
            }
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName
            };
            if (tnmInput.ScanIndexForward)
                input.ScanIndexForward = tnmInput.ScanIndexForward;
            if (tnmInput.ConsistentRead)
                input.ConsistentRead = tnmInput.ConsistentRead;
            if (tnmInput.ExclusiveStartKey)
                input.ExclusiveStartKey = __1.Mapper.formation(tnmInput.ExclusiveStartKey, TClass);
            if (tnmInput.IndexName)
                input.IndexName = tnmInput.IndexName;
            if (tnmInput.Limit)
                input.Limit = tnmInput.Limit;
            if (tnmInput.ReturnConsumedCapacity)
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            if (tnmInput.Select)
                input.Select = tnmInput.Select;
            // Parse expression.
            const exps = [];
            if (tnmInput.FilterExpression) {
                exps.push(tnmInput.FilterExpression);
                input.FilterExpression = tnmInput.FilterExpression;
            }
            if (tnmInput.ProjectionExpression) {
                exps.push(tnmInput.ProjectionExpression);
                input.ProjectionExpression = tnmInput.ProjectionExpression;
            }
            if (exps.length) {
                input.ExpressionAttributeNames = expressionParser_1.default.getExpressionAttributeNames(exps, tnmInput.ExpressionAttributeNames);
                input.ExpressionAttributeValues = expressionParser_1.default.getExpressionAttributeValues(exps, tnmInput.ExpressionAttributeValues);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.query(input).promise();
                    resolve({
                        $response: result.$response,
                        Items: result.Items ? result.Items.map((v) => __1.Mapper.deformation(v, TClass)) : result.Items,
                        Count: result.Count,
                        ScannedCount: result.ScannedCount,
                        LastEvaluatedKey: result.LastEvaluatedKey
                            ? __1.Mapper.deformation(result.LastEvaluatedKey, TClass)
                            : result.LastEvaluatedKey,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
}
exports.default = Tynamo;
//# sourceMappingURL=tynamo.js.map