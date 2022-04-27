import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodos } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO_OK: Implement creating a new TODO item
    const userId = getUserId(event)
    let attachmentUrl: string;
    if (JSON.parse(event.body).attachmentUrl) {
      attachmentUrl = JSON.parse(event.body).attachmentUrl;
    }
    const todos = await createTodos(newTodo, userId, attachmentUrl);
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
