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
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const __1 = require("..");
class TynamoTable {
    constructor(TClass, connection) {
        this.TClass = TClass;
        this.connection = connection;
    }
    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create Key Schema, Key Attr Definitions.
            const keys = __1.MetaData.getKeysByTClass(this.TClass);
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
    describeTable() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
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
    deleteTable() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
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
            const formationedItem = __1.Mapper.formation(tnmInput.Item, this.TClass);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Item: formationedItem
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            }));
            input.TableName = tableInfo.TableName;
            input.Item = formationedItem;
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
            // Load table info.
            const formationedKey = __1.Mapper.formation(tnmInput.Key, this.TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
            }));
            input.TableName = tableInfo.TableName;
            input.Key = formationedKey;
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const formationedKey = __1.Mapper.formation(tnmInput.Key, this.TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
            }));
            input.TableName = tableInfo.TableName;
            input.Key = formationedKey;
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const formationedKey = __1.Mapper.formation(tnmInput.Key, this.TClass, type_1.FormationMask.KeyOnly);
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName,
                Key: formationedKey
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                UpdateExpression: tnmInput.UpdateExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            }));
            input.TableName = tableInfo.TableName;
            input.Key = formationedKey;
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
    scan(tnmInput = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                FilterExpression: tnmInput.FilterExpression,
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            }));
            input.TableName = tableInfo.TableName;
            if (tnmInput.ExclusiveStartKey) {
                input.ExclusiveStartKey = __1.Mapper.formation(tnmInput.ExclusiveStartKey, this.TClass, type_1.FormationMask.KeyOnly);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
    query(tnmInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create input.
            const input = {
                TableName: tableInfo.TableName
            };
            Object.assign(input, tnmInput);
            Object.assign(input, __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                KeyConditionExpression: tnmInput.KeyConditionExpression,
                FilterExpression: tnmInput.FilterExpression,
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            }));
            input.TableName = tableInfo.TableName;
            if (tnmInput.ExclusiveStartKey) {
                input.ExclusiveStartKey = __1.Mapper.formation(tnmInput.ExclusiveStartKey, this.TClass, type_1.FormationMask.KeyOnly);
            }
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
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
    __batchGet(input, tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
            return new Promise(function (resolve) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.batchGetItem(input).promise();
                    resolve({
                        $response: result.$response,
                        Responses: result.Responses
                            ? result.Responses[tableName].map((v) => __1.Mapper.deformation(v, TClass))
                            : result.Responses,
                        UnprocessedKeys: result.UnprocessedKeys
                            ? (_a = result.UnprocessedKeys[tableName]) === null || _a === void 0 ? void 0 : _a.Keys.map((key) => __1.Mapper.deformation(key, TClass)) : result.UnprocessedKeys,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
    __batchWrite(input, tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call DynamoDB API.
            const connection = this.connection;
            const TClass = this.TClass;
            return new Promise(function (resolve) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield connection.batchWriteItem(input).promise();
                    resolve({
                        $response: result.$response,
                        UnprocessedItems: result.UnprocessedItems
                            ? (_a = result.UnprocessedItems[tableName]) === null || _a === void 0 ? void 0 : _a.map((v) => {
                                if (v.PutRequest) {
                                    // put.
                                    return {
                                        Operation: "put",
                                        Item: __1.Mapper.deformation(v.PutRequest.Item, TClass)
                                    };
                                }
                                else if (v.DeleteRequest) {
                                    // delete.
                                    return {
                                        Operation: "delete",
                                        Key: __1.Mapper.deformation(v.DeleteRequest.Key, TClass)
                                    };
                                }
                                throw new Error(`Receive empty item.`);
                            }) : result.UnprocessedItems,
                        ItemCollectionMetrics: result.ItemCollectionMetrics,
                        ConsumedCapacity: result.ConsumedCapacity
                    });
                });
            });
        });
    }
    batchGetItem(tnmInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create inputs.
            const inputs = [];
            let idx = 0;
            while (true) {
                const targets = tnmInput.RequestItems.slice(idx, idx + 100);
                if (targets.length === 0)
                    break;
                else
                    idx += 100;
                const input = {
                    RequestItems: {
                        [tableInfo.TableName]: {
                            Keys: targets.map((v) => __1.Mapper.formation(v, this.TClass, type_1.FormationMask.KeyOnly)),
                            ConsistentRead: tnmInput.ConsistentRead
                        }
                    }
                };
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
                Object.assign(input.RequestItems[tableInfo.TableName], __1.ExpressionParser.getFilteredExpressionSet(this.TClass, {
                    ProjectionExpression: tnmInput.ProjectionExpression,
                    ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
                }));
                inputs.push(input);
            }
            const smallBatchGetRequests = [];
            for (const input of inputs)
                smallBatchGetRequests.push(this.__batchGet(input, tableInfo.TableName));
            // Call APIs.
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const results = yield Promise.all(smallBatchGetRequests);
                    resolve(results.reduce(function (acc, current) {
                        acc.$response = current.$response;
                        if (current.Responses) {
                            if (!acc.Responses)
                                acc.Responses = [];
                            acc.Responses.push(...current.Responses);
                        }
                        if (current.ConsumedCapacity) {
                            if (!acc.ConsumedCapacity)
                                acc.ConsumedCapacity = [];
                            acc.ConsumedCapacity.push(...current.ConsumedCapacity);
                        }
                        if (current.UnprocessedKeys) {
                            if (!acc.UnprocessedKeys)
                                acc.UnprocessedKeys = [];
                            acc.UnprocessedKeys.push(...current.UnprocessedKeys);
                        }
                        return acc;
                    }));
                });
            });
        });
    }
    batchWriteItem(tnmInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load table info.
            const tableInfo = __1.MetaData.getTableInfoByConstructor(this.TClass);
            // Create inputs.
            const inputs = [];
            let idx = 0;
            while (true) {
                const targets = tnmInput.RequestItems.slice(idx, idx + 25);
                if (targets.length === 0)
                    break;
                else
                    idx += 25;
                const input = {
                    RequestItems: {
                        [tableInfo.TableName]: targets.map((v) => {
                            const w = {};
                            if (v.Operation === "put") {
                                // put.
                                w.PutRequest = {
                                    Item: __1.Mapper.formation(v.Item, this.TClass)
                                };
                            }
                            else {
                                // delete.
                                w.DeleteRequest = {
                                    Key: __1.Mapper.formation(v.Key, this.TClass, type_1.FormationMask.KeyOnly)
                                };
                            }
                            return w;
                        })
                    }
                };
                input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
                input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
                inputs.push(input);
            }
            const smallBatchWriteRequests = [];
            for (const input of inputs)
                smallBatchWriteRequests.push(this.__batchWrite(input, tableInfo.TableName));
            // Call APIs.
            return new Promise(function (resolve) {
                return __awaiter(this, void 0, void 0, function* () {
                    const results = yield Promise.all(smallBatchWriteRequests);
                    resolve(results.reduce(function (acc, current) {
                        acc.$response = current.$response;
                        if (current.ConsumedCapacity) {
                            if (!acc.ConsumedCapacity)
                                acc.ConsumedCapacity = [];
                            acc.ConsumedCapacity.push(...current.ConsumedCapacity);
                        }
                        if (current.ItemCollectionMetrics) {
                            if (!acc.ItemCollectionMetrics)
                                acc.ItemCollectionMetrics = { [tableInfo.TableName]: [] };
                            acc.ItemCollectionMetrics[tableInfo.TableName].push(...current.ItemCollectionMetrics[tableInfo.TableName]);
                        }
                        if (current.UnprocessedItems) {
                            if (!acc.UnprocessedItems)
                                acc.UnprocessedItems = [];
                            acc.UnprocessedItems.push(...current.UnprocessedItems);
                        }
                        return acc;
                    }));
                });
            });
        });
    }
}
exports.TynamoTable = TynamoTable;
//# sourceMappingURL=tynamo-table.js.map