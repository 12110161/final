import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateRequest } from '../requests/UpdateRequest'
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.CONTACT_TABLE,
        private readonly todoIndex = process.env.CONTACT_ID_INDEX) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos')
        const result = await this.docClient.query({ 
            TableName: this.todosTable,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items
        return items as TodoItem[]
    }

    async deleteTodo(userId: string, contactId: string) {
        logger.info('Delete todo')
    
        await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
            userId,
            contactId
          }
        }).promise()
        
    }

    async createTodos(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todo
        }).promise()
    
        return todo
    }

    async updateTodos(todo: TodoUpdate, contactId: string, userId:string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, contactId },
            UpdateExpression: 'set name=:name, gender=:gender, mobile=:mobile, email=:email, dueDate=:dueDate, done=:done',
            ConditionExpression: 'contactId = :contactId',
            ExpressionAttributeValues: {
                ':contactId' : contactId,
                ':name' : todo.name,
                ':gender' : todo.gender,
                ':mobile' : todo.mobile,
                ':email' : todo.email,
                ':dueDate' : todo.dueDate,
                ':done' : todo.done
            }
        }).promise()
    }

    async createAttachmentPresignedUrl(contactId: string, userId: string, attachmentUrl: string, updateData: UpdateRequest) {
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                contactId
            },
            UpdateExpression: 'set attachmentUrl=:attachmentUrl, gender=:gender, mobile=:mobile, email=:email',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
                ':gender' : updateData.gender,
                ':mobile' : updateData.mobile,
                ':email' : updateData.email,
            }
        }).promise();
        console.log('result ', result);
        return result;
    }
}