import {
    PropertyDescriptor,
    ClassCapture,
    TableInformation,
    TynamoPutItemInput,
    TynamoPutItemOutput,
    TynamoGetItemInput,
    TynamoGetItemOutput,
    FormationMask,
    TynamoDeleteItemInput,
    TynamoDeleteItemOutput,
    TynamoUpdateItemInput,
    TynamoUpdateItemOutput,
    TynamoScanInput,
    TynamoScanOutput,
    TynamoQueryInput,
    TynamoQueryOutput,
    TynamoBatchGetItemInput,
    TynamoBatchGetItemOutput,
    TynamoBatchWriteItemInput,
    TynamoBatchWriteItemOutput,
    PutOrDelete
} from "./type";
import {
    KeySchema,
    AttributeMap,
    CreateTableOutput,
    PutItemInput,
    AttributeDefinitions,
    CreateTableInput,
    DescribeTableOutput,
    DescribeTableInput,
    DeleteTableOutput,
    DeleteTableInput,
    GetItemInput,
    DeleteItemInput,
    UpdateItemInput,
    ScanInput,
    QueryInput,
    BatchGetItemInput,
    BatchGetItemOutput,
    KeysAndAttributes,
    BatchWriteItemInput,
    BatchWriteItemOutput,
    WriteRequest,
    TransactGetItemsInput,
    TransactGetItemsOutput,
    TransactWriteItemsInput,
    TransactWriteItemsOutput
} from "aws-sdk/clients/dynamodb";
import { MetaData, Mapper, ExpressionParser } from "..";

export class TynamoTable<TSource> {
    private TClass: ClassCapture<TSource>;
    private connection: AWS.DynamoDB;
    constructor(TClass: ClassCapture<TSource>, connection: AWS.DynamoDB) {
        this.TClass = TClass;
        this.connection = connection;
    }

    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    async createTable(): Promise<CreateTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create Key Schema, Key Attr Definitions.
        const keys: PropertyDescriptor<any, any>[] = MetaData.getKeysByTClass(this.TClass);
        const keySchemaDef: KeySchema = [];
        const keyAttrDef: AttributeDefinitions = [];
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
        const input: CreateTableInput = {
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
    }

    /**
     * Get information of table corresponding given class.
     */
    async describeTable(): Promise<DescribeTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: DescribeTableInput = {
            TableName: tableInfo.TableName
        };

        // Call DynamoDB API.
        return this.connection.describeTable(input).promise();
    }

    /**
     * Delete table corresponding given class.
     */
    async deleteTable(): Promise<DeleteTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const deleteTableInput: DeleteTableInput = {
            TableName: tableInfo.TableName
        };

        // Call DynamoDB API.
        return this.connection.deleteTable(deleteTableInput).promise();
    }

    /**
     * Put item with conditional expression.
     */
    async putItem(tnmInput: TynamoPutItemInput<TSource>): Promise<TynamoPutItemOutput<TSource>> {
        // Load table info.
        const formationedItem: AttributeMap = Mapper.formation(tnmInput.Item, this.TClass);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: PutItemInput = {
            TableName: tableInfo.TableName,
            Item: formationedItem
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            })
        );
        input.TableName = tableInfo.TableName;
        input.Item = formationedItem;

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.putItem(input).promise();
            resolve({
                $response: result.$response,
                Attributes: result.Attributes ? Mapper.deformation(result.Attributes, TClass) : undefined,
                ConsumedCapacity: result.ConsumedCapacity,
                ItemCollectionMetrics: result.ItemCollectionMetrics
            });
        });
    }

    /**
     * Put item with projection expression.
     */
    async getItem(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>> {
        // Load table info.
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, this.TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: GetItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
            })
        );
        input.TableName = tableInfo.TableName;
        input.Key = formationedKey;

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.getItem(input).promise();

            resolve({
                $response: result.$response,
                Item: result.Item ? Mapper.deformation(result.Item, TClass) : undefined,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    /**
     * Delete item with conditional expression.
     */
    async deleteItem(tnmInput: TynamoDeleteItemInput<TSource>): Promise<TynamoDeleteItemOutput<TSource>> {
        // Load table info.
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, this.TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: DeleteItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
            })
        );
        input.TableName = tableInfo.TableName;
        input.Key = formationedKey;

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.deleteItem(input).promise();
            resolve({
                $response: result.$response,
                Attributes: result.Attributes ? Mapper.deformation(result.Attributes, TClass) : undefined,
                ConsumedCapacity: result.ConsumedCapacity,
                ItemCollectionMetrics: result.ItemCollectionMetrics
            });
        });
    }

    async updateItem(tnmInput: TynamoUpdateItemInput<TSource>): Promise<TynamoUpdateItemOutput<TSource>> {
        // Load table info.
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, this.TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: UpdateItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                ConditionExpression: tnmInput.ConditionExpression,
                UpdateExpression: tnmInput.UpdateExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            })
        );
        input.TableName = tableInfo.TableName;
        input.Key = formationedKey;

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.updateItem(input).promise();
            resolve({
                $response: result.$response,
                Attributes: result.Attributes ? Mapper.deformation(result.Attributes, TClass) : undefined,
                ConsumedCapacity: result.ConsumedCapacity,
                ItemCollectionMetrics: result.ItemCollectionMetrics
            });
        });
    }

    /**
     * Scan table with filter, projection expressions.
     */
    async scan(tnmInput: TynamoScanInput<TSource> = {}): Promise<TynamoScanOutput<TSource>> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: ScanInput = {
            TableName: tableInfo.TableName
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                FilterExpression: tnmInput.FilterExpression,
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            })
        );
        input.TableName = tableInfo.TableName;
        if (tnmInput.ExclusiveStartKey) {
            input.ExclusiveStartKey = Mapper.formation(tnmInput.ExclusiveStartKey, this.TClass, FormationMask.KeyOnly);
        }

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.scan(input).promise();
            resolve({
                $response: result.$response,
                Items: result.Items ? result.Items.map((v) => Mapper.deformation(v, TClass)) : result.Items,
                Count: result.Count,
                ScannedCount: result.ScannedCount,
                LastEvaluatedKey: result.LastEvaluatedKey
                    ? Mapper.deformation(result.LastEvaluatedKey, TClass)
                    : result.LastEvaluatedKey,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    /**
     * Query table with filter, projection expressions.
     */
    async query(tnmInput: TynamoQueryInput<TSource>): Promise<TynamoQueryOutput<TSource>> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create input.
        const input: QueryInput = {
            TableName: tableInfo.TableName
        };
        Object.assign(input, tnmInput);
        Object.assign(
            input,
            ExpressionParser.getFilteredExpressionSet(this.TClass, {
                KeyConditionExpression: tnmInput.KeyConditionExpression,
                FilterExpression: tnmInput.FilterExpression,
                ProjectionExpression: tnmInput.ProjectionExpression,
                ExpressionAttributeNames: tnmInput.ExpressionAttributeNames,
                ExpressionAttributeValues: tnmInput.ExpressionAttributeValues
            })
        );
        input.TableName = tableInfo.TableName;
        if (tnmInput.ExclusiveStartKey) {
            input.ExclusiveStartKey = Mapper.formation(tnmInput.ExclusiveStartKey, this.TClass, FormationMask.KeyOnly);
        }

        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.query(input).promise();
            resolve({
                $response: result.$response,
                Items: result.Items ? result.Items.map((v) => Mapper.deformation(v, TClass)) : result.Items,
                Count: result.Count,
                ScannedCount: result.ScannedCount,
                LastEvaluatedKey: result.LastEvaluatedKey
                    ? Mapper.deformation(result.LastEvaluatedKey, TClass)
                    : result.LastEvaluatedKey,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    private async __batchGet(input: BatchGetItemInput, tableName: string): Promise<TynamoBatchGetItemOutput<TSource>> {
        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.batchGetItem(input).promise();
            resolve({
                $response: result.$response,
                Responses: result.Responses
                    ? result.Responses[tableName].map((v) => Mapper.deformation(v, TClass))
                    : result.Responses,
                UnprocessedKeys: result.UnprocessedKeys
                    ? result.UnprocessedKeys[tableName]?.Keys.map((key) => Mapper.deformation(key, TClass))
                    : result.UnprocessedKeys,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    private async __batchWrite(
        input: BatchWriteItemInput,
        tableName: string
    ): Promise<TynamoBatchWriteItemOutput<TSource>> {
        // Call DynamoDB API.
        const connection = this.connection;
        const TClass = this.TClass;
        return new Promise(async function(resolve) {
            const result = await connection.batchWriteItem(input).promise();
            resolve({
                $response: result.$response,
                UnprocessedItems: result.UnprocessedItems
                    ? result.UnprocessedItems[tableName]?.map<PutOrDelete<TSource>>((v) => {
                          if (v.PutRequest) {
                              // put.
                              return {
                                  Operation: "put",
                                  Item: Mapper.deformation(v.PutRequest.Item, TClass)
                              };
                          } else if (v.DeleteRequest) {
                              // delete.
                              return {
                                  Operation: "delete",
                                  Key: Mapper.deformation(v.DeleteRequest.Key, TClass)
                              };
                          }
                          throw new Error(`Receive empty item.`);
                      })
                    : result.UnprocessedItems,
                ItemCollectionMetrics: result.ItemCollectionMetrics,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    async batchGetItem(tnmInput: TynamoBatchGetItemInput<TSource>): Promise<TynamoBatchGetItemOutput<TSource>> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create inputs.
        const inputs: BatchGetItemInput[] = [];
        let idx: number = 0;
        while (true) {
            const targets: Partial<TSource>[] = tnmInput.RequestItems.slice(idx, idx + 100);
            if (targets.length === 0) break;
            else idx += 100;

            const input: BatchGetItemInput = {
                RequestItems: {
                    [tableInfo.TableName]: {
                        Keys: targets.map((v) => Mapper.formation(v, this.TClass, FormationMask.KeyOnly)),
                        ConsistentRead: tnmInput.ConsistentRead
                    }
                }
            };
            input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
            Object.assign(
                input.RequestItems[tableInfo.TableName],
                ExpressionParser.getFilteredExpressionSet(this.TClass, {
                    ProjectionExpression: tnmInput.ProjectionExpression,
                    ExpressionAttributeNames: tnmInput.ExpressionAttributeNames
                })
            );

            inputs.push(input);
        }
        const smallBatchGetRequests: Promise<TynamoBatchGetItemOutput<TSource>>[] = [];
        for (const input of inputs) smallBatchGetRequests.push(this.__batchGet(input, tableInfo.TableName));

        // Call APIs.
        return new Promise(async function(resolve) {
            const results = await Promise.all(smallBatchGetRequests);
            resolve(
                results.reduce(function(acc, current) {
                    acc.$response = current.$response;
                    if (current.Responses) {
                        if (!acc.Responses) acc.Responses = [];
                        acc.Responses.push(...current.Responses);
                    }
                    if (current.ConsumedCapacity) {
                        if (!acc.ConsumedCapacity) acc.ConsumedCapacity = [];
                        acc.ConsumedCapacity.push(...current.ConsumedCapacity);
                    }
                    if (current.UnprocessedKeys) {
                        if (!acc.UnprocessedKeys) acc.UnprocessedKeys = [];
                        acc.UnprocessedKeys.push(...current.UnprocessedKeys);
                    }
                    return acc;
                })
            );
        });
    }

    async batchWriteItem(tnmInput: TynamoBatchWriteItemInput<TSource>): Promise<TynamoBatchWriteItemOutput<TSource>> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(this.TClass);

        // Create inputs.
        const inputs: BatchWriteItemInput[] = [];
        let idx: number = 0;
        while (true) {
            const targets: PutOrDelete<TSource>[] = tnmInput.RequestItems.slice(idx, idx + 25);
            if (targets.length === 0) break;
            else idx += 25;

            const input: BatchWriteItemInput = {
                RequestItems: {
                    [tableInfo.TableName]: targets.map((v) => {
                        const w: WriteRequest = {};
                        if (v.Operation === "put") {
                            // put.
                            w.PutRequest = {
                                Item: Mapper.formation(v.Item, this.TClass)
                            };
                        } else {
                            // delete.
                            w.DeleteRequest = {
                                Key: Mapper.formation(v.Key, this.TClass, FormationMask.KeyOnly)
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
        const smallBatchWriteRequests: Promise<TynamoBatchWriteItemOutput<TSource>>[] = [];
        for (const input of inputs) smallBatchWriteRequests.push(this.__batchWrite(input, tableInfo.TableName));

        // Call APIs.
        return new Promise(async function(resolve) {
            const results = await Promise.all(smallBatchWriteRequests);
            resolve(
                results.reduce(function(acc, current) {
                    acc.$response = current.$response;
                    if (current.ConsumedCapacity) {
                        if (!acc.ConsumedCapacity) acc.ConsumedCapacity = [];
                        acc.ConsumedCapacity.push(...current.ConsumedCapacity);
                    }
                    if (current.ItemCollectionMetrics) {
                        if (!acc.ItemCollectionMetrics) acc.ItemCollectionMetrics = { [tableInfo.TableName]: [] };
                        acc.ItemCollectionMetrics[tableInfo.TableName].push(
                            ...current.ItemCollectionMetrics[tableInfo.TableName]
                        );
                    }
                    if (current.UnprocessedItems) {
                        if (!acc.UnprocessedItems) acc.UnprocessedItems = [];
                        acc.UnprocessedItems.push(...current.UnprocessedItems);
                    }
                    return acc;
                })
            );
        });
    }
}
