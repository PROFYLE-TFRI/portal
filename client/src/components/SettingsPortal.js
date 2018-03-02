import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Table, Row, Col, Alert, Input, Label, Form, FormGroup, } from 'reactstrap';

import Button from './Button'

import asString from '../helpers/as-string'
import { update } from '../actions/user';
import * as UserUtils from '../helpers/user'


const mapStateToProps = state => ({
  isLoading: state.users.isLoading,
  user: state.auth.user,
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ update }, dispatch)

class SettingsPortal extends Component {
  constructor(props) {
    super(props)
    const { user = {}, isLoading } = props
    this.state = {
      isLoading,
      user: UserUtils.deserialize(user)
    }
  }

  componentWillReceiveProps({ user = {}, isLoading }) {
    this.setState({
      isLoading,
      user: UserUtils.deserialize(user)
    })
  }

  onSubmit = (ev) => {
    ev.preventDefault()

    const diff = UserUtils.getDiffObject(
      this.props.user,
      UserUtils.serialize(this.state.user)
    )

    this.setState({ isLoading: true })
    this.props.update(diff)
    .catch(() => Promise.resolve())
    .then(() => this.setState({ isLoading: false }))
  }

  getSetter = (prop) => {
    return ev => this.setState({ user: { ...this.state.user, [prop]: ev.target.value } })
  }

  render() {
    const { user, isLoading } = this.state

    return (
      <Container className='SettingsPortal'>
        <Form onSubmit={this.onSubmit} autocomplete='off'>
          <FormGroup row>
            <Label for='name' sm={2}>Name</Label>
            <Col sm={10}>
              <Input
                type='text'
                id='name'
                defaultValue={user.name}
                onChange={this.getSetter('name')}
                required
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='email' sm={2}>Email</Label>
            <Col sm={10}>
              <Input
                type='email'
                id='email'
                defaultValue={user.email}
                onChange={this.getSetter('email')}
                required
                autocomplete='new-email'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='new-password' sm={2}>Password</Label>
            <Col sm={10}>
              <Input
                type='password'
                id='new-password'
                defaultValue={user.password}
                onChange={this.getSetter('password')}
                required
                autocomplete='new-password'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='phone' sm={2}>Phone</Label>
            <Col sm={10}>
              <Input
                type='text'
                id='phone'
                defaultValue={user.phone}
                onChange={this.getSetter('phone')}
                required
                pattern='\d{10}'
              />
            </Col>
          </FormGroup>

          <FormGroup>
            <Button
              icon='check'
              outline
              color='primary'
              loading={isLoading}
            >
              Save
            </Button>
          </FormGroup>
        </Form>
      </Container>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPortal);
