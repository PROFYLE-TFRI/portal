import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Table, Alert, Input, } from 'reactstrap';

import Button from './Button'

import asString from '../helpers/as-string'
import * as User from '../actions/user';
import * as UserUtils from '../helpers/user'
import getDiffObject from '../helpers/get-diff-object'


const ACTIONS = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
}

const mapStateToProps = state => ({
  users: state.users
})
const mapDispatchToProps = dispatch =>
  bindActionCreators(User, dispatch)

class UserPortal extends Component {
  state = {
    action: undefined,
    userID: undefined,
  }

  onCancel = () => {
    this.setState({ action: undefined, userID: undefined })
  }

  onAccept = (newUser) => {
    let action

    if (this.state.action === ACTIONS.CREATE) {
      action = this.props.create(newUser)
    } else {
      const user = this.props.users.data.find(u => u.id === this.state.userID)
      const diff = getDiffObject(user, newUser)
      action = this.props.update(diff)
    }

    action.then(() => this.setState({ action: undefined, userID: undefined }))
  }

  render() {
    const { users } = this.props
    const { action, userID } = this.state

    return (
      <Container className='UserPortal'>
        {
          users.message &&
          <Alert color='danger'>
            <h4 className='alert-heading'>
              An error occured:
            </h4>
            <p>
              { asString(users.message) }
            </p>
          </Alert>
        }
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
                    <td>{ renderPhone(user.phone) }</td>
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
                        onClick={() => this.props.remove(user.id)}
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

        <Button
          icon='plus'
          outline
          color='success'
          size='sm'
          loading={users.isLoading}
          onClick={() => this.setState({ action: ACTIONS.CREATE })}
        >
          Create New User
        </Button>
      </Container>
    )
  }
}

class EditRow extends React.Component {
  constructor(props) {
    super(props)
    const { user = UserUtils.createNew() } = props
    this.state = UserUtils.deserialize(user)
  }

  componentWillReceiveProps({ user = UserUtils.createNew() }) {
    this.setState(UserUtils.deserialize(user))
  }

  onClickAccept = () => {
    const user = UserUtils.serialize(this.state)
    this.props.onAccept(user)
  }

  render() {
    const { user, onCancel } = this.props

    return (
      <tr>
        <th scope='row'>
          { user.id }
          <input type='hidden' name='id' value={user.id} />
        </th>
        <td><Input type='text'     name='name'         defaultValue={user.name}                         onChange={ev => this.setState({ name: ev.target.value })} /></td>
        <td><Input type='email'    name='email'        defaultValue={user.email}                        onChange={ev => this.setState({ email: ev.target.value })} /></td>
        <td><Input type='password' name='new-password' defaultValue={user.password}                     onChange={ev => this.setState({ password: ev.target.value })} autoComplete='new-password' /></td>
        <td><Input type='text'     name='phone'        defaultValue={user.phone}                        onChange={ev => this.setState({ phone: ev.target.value })} /></td>
        <td><input type='checkbox' name='isAdmin'      defaultChecked={user.isAdmin}                    onChange={ev => this.setState({ isAdmin: ev.target.checked })} /></td>
        <td><Input type='text'     name='permissions'  defaultValue={JSON.stringify(user.permissions)}  onChange={ev => this.setState({ permissions: ev.target.value })} /></td>
        <td>
          <Button
            type='button'
            icon='check'
            outline
            color='success'
            size='sm'
            onClick={this.onClickAccept}
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
}

function renderPhone(phone) {
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPortal);
