/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  gender: string
  email: string
  mobile: string
  dueDate: string
  done: boolean
  
}