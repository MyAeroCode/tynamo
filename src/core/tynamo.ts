import {
    TableInformation,
    PropertyDescriptor,
    TynamoPutItemInput,
    TynamoGetItemInput,
    FormationMask,
    TynamoGetItemOutput,
    TynamoPutItemOutput
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
    GetItemInput
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
    async createTable(TClass: any): Promise<CreateTableOutput> {
        // Load table info.
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TClass);

        // Create Key Schema, Key Attr Definitions.
        const keys: PropertyDescriptor<any>[] = MetaData.getKeysByConstructor(TClass);
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
    async describeTable(TClass: any): Promise<DescribeTableOutput> {
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
    async deleteTable(TClass: any): Promise<DeleteTableOutput> {
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
        // Load table info.
        const TSourceConstructor: any = (tnmInput.Item as any).constructor;
        const formationedItem: AttributeMap = Mapper.formation(tnmInput.Item, TSourceConstructor);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TSourceConstructor);

        // Create input.
        const input: PutItemInput = {
            TableName: tableInfo.TableName,
            Item: formationedItem
        };
        if (tnmInput.ReturnItemCollectionMetrics)
            input.ReturnItemCollectionMetrics = tnmInput.ReturnItemCollectionMetrics;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.ReturnValues) input.ReturnValues = tnmInput.ReturnValues;
        if (tnmInput.ConditionExpression) {
            input.ConditionExpression = tnmInput.ConditionExpression;
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                tnmInput.ConditionExpression,
                formationedItem,
                tnmInput.ExpressionAttributeNames
            );
            input.ExpressionAttributeValues = ExpressionParser.getExpressionAttributeValues(
                tnmInput.ConditionExpression,
                tnmInput.ArgsItem
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
        return new Promise(async function(resolve) {
            const result = await connection.putItem(input).promise();
            resolve({
                $response: result.$response,
                Attributes: result.Attributes ? Mapper.deformation(result.Attributes, TSourceConstructor) : undefined,
                ConsumedCapacity: result.ConsumedCapacity,
                ItemCollectionMetrics: result.ItemCollectionMetrics
            });
        });
    }

    /**
     * Put item with projection expression.
     */
    async getItem<TSource>(tnmInput: TynamoGetItemInput<TSource>): Promise<TynamoGetItemOutput<TSource>> {
        // Load table info.
        const TSourceConstructor: any = (tnmInput.Key as any).constructor;
        const formationedKey: AttributeMap = Mapper.formation(tnmInput.Key, TSourceConstructor, FormationMask.KeyOnly);
        const tableInfo: TableInformation = MetaData.getTableInfoByConstructor(TSourceConstructor);

        // Create input.
        const input: GetItemInput = {
            TableName: tableInfo.TableName,
            Key: formationedKey
        };
        if (tnmInput.ConsistentRead) input.ConsistentRead = tnmInput.ConsistentRead;
        if (tnmInput.ReturnConsumedCapacity) input.ReturnConsumedCapacity = tnmInput.ReturnConsumedCapacity;
        if (tnmInput.ProjectionExpression) {
            input.ProjectionExpression = tnmInput.ProjectionExpression;
            input.ExpressionAttributeNames = ExpressionParser.getExpressionAttributeNames(
                input.ProjectionExpression,
                formationedKey,
                tnmInput.ExpressionAttributeNames
            );
        }

        // Call DynamoDB API.
        const connection = this.connection;
        return new Promise(async function(resolve) {
            const result = await connection.getItem(input).promise();
            resolve({
                Item: result.Item ? Mapper.deformation(result.Item, TSourceConstructor) : undefined,
                ConsumedCapacity: result.ConsumedCapacity
            });
        });
    }

    // async deleteItem(){}
    // async updateItem(){}
    // async batchGetItem() {}
    // async batchWriteItem() {}
    // async transactGetItems() {}
    // async transactWriteItems() {}
    // async scan(){}
    // async query(){}
}
