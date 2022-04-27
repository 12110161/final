import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { UpdateRequest } from '../requests/UpdateRequest'
import * as uuid from 'uuid'

// import * as createError from 'http-errors'

const todosAcess = new TodosAccess()
const logger = createLogger('auth')

// TODO_OK: Implement businessLogic
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos by userId')
    return todosAcess.getTodosForUser(userId)
}

export async function deleteTodo(userId: string, contactId: string) {
  logger.info('Delete todo by userId: ', userId)
  return todosAcess.deleteTodo(userId, contactId)
}

export async function updateTodos(todo: UpdateTodoRequest, contactId: string, userId:string) {
  logger.info('Update todo successfully', {
    key: contactId
  })
  return todosAcess.updateTodos(todo, contactId, userId)
}

export async function createTodos(
  createTodoRequest: CreateTodoRequest,
  userId: string,
  attachmentUrl: string
): Promise<TodoItem> {

  const contactId = uuid.v4()

  // return await todosAcess.createTodos({
  const request: TodoItem = {
    contactId: contactId,
    userId: userId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    email: '',
    gender: '',
    mobile: '',
    dueDate: createTodoRequest.dueDate,
    done: false

  }

  if (attachmentUrl) {
    request.attachmentUrl = attachmentUrl;
  }

  const result = await todosAcess.createTodos(request);
  logger.info('Create todo successfully', {
    key: result
  })
  return result;
}

export async function createAttachmentPresignedUrl(contactId: string, userId: string, attachmentUrl: string, updateData: UpdateRequest) {
  logger.info('Create Attachment PresignedUrl', attachmentUrl)
  return await todosAcess.createAttachmentPresignedUrl(contactId, userId, attachmentUrl, updateData);
}