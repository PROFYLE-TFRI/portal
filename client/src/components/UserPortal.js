import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Table, Alert, Input, } from 'reactstrap';

import Button from './Button'
import Time from './Time'

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
    const { ok, message } = validateUser(newUser)

    if (!ok) {
      this.props.setMessage(message)
      return
    }

    let action

    if (this.state.action === ACTIONS.CREATE) {
      action = this.props.create(newUser)
    } else {
      const userData = this.props.users.data.find(u => u.id === this.state.userID)
      const user = UserUtils.deserialize(userData)

      const didChange = Object.keys(newUser).some(key => newUser[key] !== user[key])

      if (!didChange) {
        action = Promise.resolve()
      } else {
        const diff = getDiffObject(userData, UserUtils.serialize(newUser))
        action = this.props.update(diff)
      }
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
          <Alert color='danger' isOpen={true} toggle={this.props.clearMessage}>
            <h4 className='alert-heading'>
              Error:
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
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              users.data.map(user =>
                action === ACTIONS.EDIT && userID === user.id ?
                  <EditRow key={user.id} user={user} onAccept={this.onAccept} onCancel={this.onCancel} />
                :
                  <tr key={user.id}>
                    <th scope='row'>{ user.id }</th>
                    <td>{ user.name }</td>
                    <td>{ user.email }</td>
                    <td><b>{ '*'.repeat(8)}</b></td>
                    <td>{ renderPhone(user.phone) }</td>
                    <td>{ user.isAdmin.toString() }</td>
                    <td>{ JSON.stringify(user.permissions) }</td>
                    <td><Time value={user.lastLogin} /></td>
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
    this.state = {
      user: UserUtils.deserialize(user),
      passwordConfirmation: '',
      focusPassword: false,
    }
  }

  componentWillReceiveProps({ user = UserUtils.createNew() }) {
    this.setState({ user: UserUtils.deserialize(user), passwordConfirmation: '' })
  }

  setUserState(patch) {
    this.setState({ user: { ...this.state.user, ...patch } })
  }

  onFocusPassword = () => {
    this.setState({ focusPassword: true })
  }

  onBlurPassword = () => {
    this.setState({ focusPassword: false })
  }

  onClickAccept = () => {
    if (this.state.user.password && this.state.user.password !== this.state.passwordConfirmation)
      return

    this.props.onAccept(this.state.user)
  }

  render() {
    const { user, onCancel } = this.props

    console.log(Boolean(this.state.user.password) && !this.state.focusPassword && this.state.user.password !== this.state.passwordConfirmation)
    console.log(this.state.user.password, this.state.passwordConfirmation, this.state.focusPassword)

    return (
      <tr>
        <th scope='row'>
          { user.id }
          <input type='hidden' name='id' value={user.id} />
        </th>
        <td><Input type='text'     name='name'         defaultValue={user.name}                         onChange={ev => this.setUserState({ name: ev.target.value })} /></td>
        <td><Input type='email'    name='email'        defaultValue={user.email}                        onChange={ev => this.setUserState({ email: ev.target.value })} /></td>
        <td>
          <Input
            type='password'
            name='new-password'
            autoComplete='new-password'
            placeholder='Password'
            valid={Boolean(this.state.user.password) && this.state.user.password === this.state.passwordConfirmation}
            invalid={Boolean(this.state.user.password) && !this.state.focusPassword && this.state.user.password !== this.state.passwordConfirmation}
            onChange={ev => this.setUserState({ password: ev.target.value })}
            onFocus={this.onFocusPassword}
            onBlur={this.onBlurPassword}
          />
          <Input
            type='password'
            name='new-password'
            autoComplete='new-password'
            placeholder='Repeat password'
            onChange={ev => this.setState({ passwordConfirmation: ev.target.value })}
            onFocus={this.onFocusPassword}
            onBlur={this.onBlurPassword}
          />
        </td>
        <td><Input type='text'     name='phone'        defaultValue={user.phone}                        onChange={ev => this.setUserState({ phone: ev.target.value })} /></td>
        <td><input type='checkbox' name='isAdmin'      defaultChecked={user.isAdmin}                    onChange={ev => this.setUserState({ isAdmin: ev.target.checked })} /></td>
        <td><Input type='text'     name='permissions'  defaultValue={JSON.stringify(user.permissions)}  onChange={ev => this.setUserState({ permissions: ev.target.value })} /></td>
        <td/>
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
  if (!phone)
    return <span className='text-muted'>none</span>

  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
}

function validateUser(user) {
  if (!user.email)
    return { ok: false, message: 'User email is required' }

  if (!user.name)
    return { ok: false, message: 'User name is required' }

  try {
    JSON.parse(user.permissions)
  } catch (err) {
    return { ok: false, message: 'User permissions is not a valid JSON value' }
  }

  return { ok: true }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPortal);
