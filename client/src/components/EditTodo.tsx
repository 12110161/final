import * as React from 'react'
import { Form, Button, Radio, Input, Icon } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import validator from 'validator'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      contactId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
  gender: string
  mobile: string
  email: string
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    gender: 'Male',
    mobile: '',
    email: ''
  }

  handleChangeGender = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ gender: event.currentTarget.outerText })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }
      
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.contactId, {
        gender: this.state.gender,
        mobile: this.state.mobile,
        email: this.state.email
      })

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (error) {
      let errorMessage = "Could not upload a file:";
      if (error instanceof Error) {
        errorMessage = errorMessage + error.message;
      }
      alert(errorMessage);
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ mobile: event.target.value })
  }

  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var email = event.target.value
  
    if (!validator.isEmail(email)) {
      alert('Enter valid Email!')
    }
    this.setState({ email: event.target.value })
  }

  render() {
    return (
      <div>
        <h1>Edit contact</h1>

        <Form onSubmit={this.handleSubmit}>

        <Form.Field>
          <label>Mobile *</label>
          <Input iconPosition='left' placeholder='Phone number'>
            <Icon name='mobile' />
            <input 
              type="text"
              onChange={this.handlePhoneNumberChange}/>
          </Input>
        </Form.Field>

        <Form.Field>
          <label>Email</label>
          <Input iconPosition='left' placeholder='Email'>
            <Icon name='at' />
            <input 
              type="text"
              onBlur={this.handleEmailChange}/>
          </Input>
        </Form.Field>

        <Form.Field>
          <label>Selected value</label>
        </Form.Field>
        <Form.Field>
          <Radio
            label='Male'
            name='radioGroup'
            value='Male'
            checked={this.state.gender === 'Male'}
            onChange={this.handleChangeGender}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Female'
            name='radioGroup'
            value='Female'
            checked={this.state.gender === 'Female'}
            onChange={this.handleChangeGender}
          />
        </Form.Field>
          <Form.Field>
            <label>Avatar</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          color='orange'
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Update
        </Button>
      </div>
    )
  }
}
