import {
    TableInformation,
    PropertyDescriptor,
    TynamoPutItemInput,
    TynamoGetItemInput,
    FormationMask,
    TynamoGetItemOutput,
    TynamoPutItemOutput,
    TynamoDeleteItemInput,
    TynamoDeleteItemOutput,
    TynamoUpdateItemInput,
    TynamoUpdateItemOutput,
    TynamoScanOutput,
    TynamoScanInput,
    ClassCapture,
    TynamoQueryInput,
    TynamoQueryOutput
} from "./type";
import {
    KeySchema,
    AttributeDefinitions,
    CreateTableInput,
    CreateTableOutput,
    DeleteTableOutput,
    DeleteTableInput,
    DescribeTableOutput,
    DescribeTableInput,
    PutItemInput,
    AttributeMap,
    GetItemInput,
    DeleteItemInput,
    DeleteItemOutput,
    UpdateItemInput,
    UpdateItemOutput,
    ScanInput,
    ScanOutput,
    QueryInput,
    QueryOutput
} from "aws-sdk/clients/dynamodb";
import ExpressionParser from "./expressionParser";
import { MetaData, Mapper } from "..";
import AWS from "aws-sdk";

export default class Tynamo {
    /**
     * DynamoDB Connection.
     */
    private connection!: AWS.DynamoDB;
    constructor(options?: AWS.DynamoDB.ClientConfiguration) {
        this.connection = new AWS.DynamoDB(options);
    }

    /**
     * Create table corresponding given class.
     * When table is pre-exist, occur error.
     */
    async createTable<TSource>(TClass: ClassCapture<TSource>): Promise<CreateTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create Key Schema, Key Attr Definitions.
        const keys: PropertyDescriptor<any, any>[] = MetaData.getKeysByConstructor(TClass);
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
    async describeTable<TSource>(TClass: ClassCapture<TSource>): Promise<DescribeTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

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
    async deleteTable<TSource>(TClass: ClassCapture<TSource>): Promise<DeleteTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

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
    async putItem<TSource>(tnmInput: TynamoPutItemInput<TSource>): Promise<TynamoPutItemOutput<TSource>> {
        // Check param.
        if (
            (tnmInput.Item as any).constructor === Object ||
            (tnmInput.ExpressionAttributeValues as any)?.constructor === Object
        ) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const TClass = (tnmInput.Item as any).constructor;
        const formationedItem: AttributeMap = Mapper.formation(tnmInput.Item, TClass);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: PutItemInput = {
            TableName: tableInfo.TableName,
            Item: formationedItem
        };
        if (tnmInput.ReturnItemCollectionMetrics)
            input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.ReturnValues) input.ReturnValues = tnmInput.ReturnValues;

        // Parse expression.
        const exps: string[] = [];
        if (tnmInput.ConditionExpression) {
            exps.push(tnmInput.ConditionExpression);
            input.ConditionExpression = tnmInput.ConditionExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                exps,
                tnmInput.ExpressionAttributeValues
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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
    async getItem<TSource>(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>> {
        // Check param.
        if ((tnmInput.Key as any).constructor === Object) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const TClass = (tnmInput.Key as any).constructor;
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: GetItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        if (tnmInput.ConsistentRead) input.ConsistentRead = tnmInput.ConsistentRead;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;

        // Parse expression.
        const exps: string[] = [];
        if (tnmInput.ProjectionExpression) {
            exps.push(tnmInput.ProjectionExpression);
            input.ProjectionExpression = tnmInput.ProjectionExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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
    async deleteItem<TSource>(tnmInput: TynamoDeleteItemInput<TSource>): Promise<TynamoDeleteItemOutput<TSource>> {
        // Check param.
        if (
            (tnmInput.Key as any).constructor === Object ||
            (tnmInput.ExpressionAttributeValues as any)?.constructor === Object
        ) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const TClass = (tnmInput.Key as any).constructor;
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: DeleteItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.ReturnItemCollectionMetrics) input.ReturnConsumedCapacity = tnmInput.ReturnItemCollectionMetrics;
        if (tnmInput.ReturnValues) input.ReturnValues = tnmInput.ReturnValues;

        // Parse expression.
        const exps: string[] = [];
        if (tnmInput.ConditionExpression) {
            exps.push(tnmInput.ConditionExpression);
            input.ConditionExpression = tnmInput.ConditionExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                exps,
                tnmInput.ExpressionAttributeValues
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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

    async updateItem<TSource>(tnmInput: TynamoUpdateItemInput<TSource>): Promise<TynamoUpdateItemOutput<TSource>> {
        // Check param.
        if (
            (tnmInput.Key as any).constructor === Object ||
            (tnmInput.ExpressionAttributeValues as any)?.constructor === Object
        ) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const TClass = (tnmInput.Key as any).constructor;
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, TClass, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: UpdateItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.ReturnItemCollectionMetrics)
            input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
        if (tnmInput.ReturnValues) input.ReturnValues = tnmInput.ReturnValues;

        // Parse expression.
        const exps: string[] = [];
        if (tnmInput.ConditionExpression) {
            exps.push(tnmInput.ConditionExpression);
            input.ConditionExpression = tnmInput.ConditionExpression;
        }
        if (tnmInput.UpdateExpression) {
            exps.push(tnmInput.UpdateExpression);
            input.UpdateExpression = tnmInput.UpdateExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                exps,
                tnmInput.ExpressionAttributeValues
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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
    async scan<TSource>(
        TClass: ClassCapture<TSource>,
        tnmInput: TynamoScanInput<TSource> = {}
    ): Promise<TynamoScanOutput<TSource>> {
        // Check param.
        if ((tnmInput.ExpressionAttributeValues as any)?.constructor === Object) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: ScanInput = {
            TableName: tableInfo.TableName
        };
        if (tnmInput.ConsistentRead) input.ConsistentRead = tnmInput.ConsistentRead;
        if (tnmInput.ExclusiveStartKey) input.ExclusiveStartKey = Mapper.formation(tnmInput.ExclusiveStartKey, TClass);
        if (tnmInput.IndexName) input.IndexName = tnmInput.IndexName;
        if (tnmInput.Limit) input.Limit = tnmInput.Limit;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.Segment) input.Segment = tnmInput.Segment;
        if (tnmInput.Select) input.Select = tnmInput.Select;
        if (tnmInput.TotalSegments) input.TotalSegments = tnmInput.TotalSegments;

        // Parse expressions.
        const exps: string[] = [];
        if (tnmInput.FilterExpression) {
            exps.push(tnmInput.FilterExpression);
            input.FilterExpression = tnmInput.FilterExpression;
        }
        if (tnmInput.ProjectionExpression) {
            exps.push(tnmInput.ProjectionExpression);
            input.ProjectionExpression = tnmInput.ProjectionExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                exps,
                tnmInput.ExpressionAttributeValues
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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
    async query<TSource>(
        TClass: ClassCapture<TSource>,
        tnmInput: TynamoQueryInput<TSource>
    ): Promise<TynamoQueryOutput<TSource>> {
        // Check param.
        if ((tnmInput.ExpressionAttributeValues as any)?.constructor === Object) {
            throw new Error(`Must use constructor`);
        }

        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create input.
        const input: QueryInput = {
            TableName: tableInfo.TableName
        };
        if (tnmInput.ScanIndexForward) input.ScanIndexForward = tnmInput.ScanIndexForward;
        if (tnmInput.ConsistentRead) input.ConsistentRead = tnmInput.ConsistentRead;
        if (tnmInput.ExclusiveStartKey) input.ExclusiveStartKey = Mapper.formation(tnmInput.ExclusiveStartKey, TClass);
        if (tnmInput.IndexName) input.IndexName = tnmInput.IndexName;
        if (tnmInput.Limit) input.Limit = tnmInput.Limit;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.Select) input.Select = tnmInput.Select;

        // Parse expression.
        const exps: string[] = [];
        if (tnmInput.FilterExpression) {
            exps.push(tnmInput.FilterExpression);
            input.FilterExpression = tnmInput.FilterExpression;
        }
        if (tnmInput.ProjectionExpression) {
            exps.push(tnmInput.ProjectionExpression);
            input.ProjectionExpression = tnmInput.ProjectionExpression;
        }
        if (exps.length) {
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                exps,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                exps,
                tnmInput.ExpressionAttributeValues
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
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

    // async batchGetItem() {}
    // async batchWriteItem() {}
    // async transactGetItems() {}
    // async transactWriteItems() {}
}
