import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Table, Row, Col, Alert, Input, Label, Form, FormGroup, } from 'reactstrap';

import Button from './Button'

import * as User from '../actions/user';


const ACTIONS = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
}

const mapStateToProps = state => ({
    users: state.users
  , auth: state.auth
})
const mapDispatchToProps = dispatch =>
  bindActionCreators(User, dispatch)

class UserPortal extends Component {
  state = {
    action: undefined,
    userID: undefined,
  }

  createUser = (user) => {

  }

  onCancel = () => {
    this.setState({ action: undefined, userID: undefined })
  }

  onAccept = () => {
    const user = {
      id: document.querySelector('[name=id]').value,
      name: document.querySelector('[name=name]').value,
      email: document.querySelector('[name=email]').value,
      password: document.querySelector('[name=password]').value,
      phone: document.querySelector('[name=phone]').value,
      isAdmin: document.querySelector('[name=isAdmin]').checked,
      permissions: JSON.parse(document.querySelector('[name=permissions]').value),
    }

    let action

    if (this.state.action === ACTIONS.CREATE) {
      action = this.props.create(user)
    } else {
      if (user.password === this.props.users.data.find(u => u.id === this.state.userID).password)
        delete user.password
      action = this.props.update(user)
    }

    action.then(() => this.setState({ action: undefined, userID: undefined }))
  }

  render() {
    const { auth, users } = this.props
    const { action, userID } = this.state

    return (
      <Container className='UserPortal'>
        <Form onSubmit={this.onSubmit}>
          <Table className='UserPortal__table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Phone</th>
                <th>Admin?</th>
                <th>Permissions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                users.data.map(user =>
                  action === ACTIONS.EDIT && userID === user.id ?
                    <EditRow user={user} onAccept={this.onAccept} onCancel={this.onCancel} />
                  :
                    <tr key={user.id}>
                      <th scope='row'>{ user.id }</th>
                      <td>{ user.name }</td>
                      <td>{ user.email }</td>
                      <td><b>{ '*'.repeat(Math.random() * 6 + 4)}</b></td>
                      <td>{ user.phone }</td>
                      <td>{ user.isAdmin.toString() }</td>
                      <td>{ JSON.stringify(user.permissions) }</td>
                      <td>
                        <Button
                          icon='edit'
                          outline
                          color='warning'
                          size='sm'
                          onClick={() => this.setState({ action: ACTIONS.EDIT, userID: user.id })}
                        /> <Button
                          icon='trash'
                          outline
                          color='danger'
                          size='sm'
                        />
                      </td>
                    </tr>
                )
              }

              {
                action === ACTIONS.CREATE &&
                  <EditRow user={{ permissions: [] }} onAccept={this.onAccept} onCancel={this.onCancel} />
              }

            </tbody>
          </Table>
        </Form>

        <Button
          icon='plus'
          outline
          color='success'
          size='sm'
          onClick={() => this.setState({ action: ACTIONS.CREATE })}
        >
          Create New User
        </Button>
      </Container>
    )
  }
}

function EditRow({ user, onAccept, onCancel }) {
  return (
    <tr>
      <th scope='row'>
        { user.id }
        <input type='hidden' name='id' value={user.id} />
      </th>
      <td>
        <Input type='text' name='name' defaultValue={user.name} />
      </td>
      <td>
        <Input type='email' name='email' defaultValue={user.email} />
      </td>
      <td>
        <Input type='password' name='password' defaultValue={user.password} />
      </td>
      <td>
        <Input type='text' name='phone' defaultValue={user.phone} />
      </td>
      <td>
        <input type='checkbox' name='isAdmin' defaultChecked={user.isAdmin} />
      </td>
      <td>
        <Input type='text' name='permissions' defaultValue={JSON.stringify(user.permissions)} />
      </td>
      <td>
        <Button
          type='button'
          icon='check'
          outline
          color='success'
          size='sm'
          onClick={onAccept}
        /> <Button
          type='button'
          icon='times'
          outline
          color='secondary'
          size='sm'
          onClick={onCancel}
        />
      </td>
    </tr>
  )
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPortal);
