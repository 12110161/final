import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (contactId: string) => {
    this.props.history.push(`/todos/${contactId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (contactId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), contactId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.contactId !== contactId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.contactId, {
        name: todo.name,
        dueDate: todo.dueDate,
        gender: todo.gender,
        mobile: todo.mobile,
        email: todo.email,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (error) {
      let errorMessage = "Failed to fetch todos:";
      if (error instanceof Error) {
        errorMessage = errorMessage + error.message;
      }
      alert(errorMessage);
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Phonebooks</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            
            fluid
            actionPosition="left"
            placeholder="Name"
            onChange={this.handleNameChange}
            action={{
              color: 'orange',
              labelPosition: 'left',
              icon: 'add',
              content: 'New contact',
              onClick: this.onTodoCreate
            }}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Phonebooks
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    <Grid padded>
        <Grid.Row>
              <Grid.Column width={2} verticalAlign="middle">
                
              </Grid.Column>
              <Grid.Column width={9} verticalAlign="middle">
                Name
              </Grid.Column>
              
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
        
      </Grid>
    return (
      <Grid padded>
        <Grid.Row>
              <Grid.Column width={2} verticalAlign="middle">
                
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                Name
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                Mobile
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                Email
              </Grid.Column>
              <Grid.Column width={3} floated="right" verticalAlign="middle">
                Create date
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
               
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
               
              </Grid.Column>
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.contactId}>
              <Grid.Column width={2} verticalAlign="middle">
                {todo.attachmentUrl && (
                  <Image src={todo.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {todo.mobile}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {todo.email}
              </Grid.Column>
              <Grid.Column width={3} floated="right" verticalAlign="middle">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="teal"
                  onClick={() => this.onEditButtonClick(todo.contactId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.contactId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
