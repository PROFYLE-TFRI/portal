/*
 * Login.js
 */


import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Alert, Container, Row, Col, Form, FormGroup, Input, InputGroupAddon, InputGroup } from 'reactstrap';
import classname from 'classname';

import Icon from './Icon'
import Button from './Button'
import { logIn, requires2fa } from '../actions';



const mapStateToProps = state => ({
  auth: state.auth,
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ logIn, requires2fa }, dispatch)

const initialState = {
  email: '',
  password: '',
  code: '',
  transitionEnded: true,
  showCode: false,
}

class Login extends Component {

  state = initialState

  onSubmit = (ev) => {
    ev.preventDefault()
    const email    = this.email    ? this.email.value    : this.state.email
    const password = this.password ? this.password.value : this.state.password
    const code     = this.code     ? this.code.value     : this.state.code
    this.setState({ email, password, code })
    this.props.logIn(email, password, code)
  }

  onTransitionEnd = (ev) => {
    if (!this.state.transitionEnded)
      this.setState({ transitionEnded: true })
  }

  goBack() {
    this.props.requires2fa(false)
    if (this.code)
      this.code.value = ''
  }

  componentWillReceiveProps(props) {
    if (props.auth.requires2fa !== this.props.auth.requires2fa) {
      this.setState({ transitionEnded: false })
      setTimeout(() => this.setState({ showCode: props.auth.requires2fa }), 10)
    }
    if (props.auth.isLoggedIn !== this.props.auth.isLoggedIn) {
      this.setState(initialState)
    }
  }

  renderContent() {
    const { auth } = this.props
    const { transitionEnded } = this.state

    const showCredentials = !transitionEnded || !this.state.showCode
    const showCode        = !transitionEnded || this.state.showCode

    return (
      <Container>
        <Row>
          <Col sm={{ size: 6, offset: 3 }}>
            <h1 className='Login__title'>Log In</h1>
          </Col>
        </Row>
        <Row>
          <Col sm={{ size: 6, offset: 3 }} className={
            classname('Login__form', { 'Login__form--requires2fa': this.state.showCode})
          }
          >

            <div className='Login__tabs'>
              {
                showCredentials &&
                <div className='Login__credentials' onTransitionEnd={this.onTransitionEnd}>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                        <label htmlFor='email' className='input-group-text Login__label'>Email</label>
                      </InputGroupAddon>
                      <Input type='email' name='email' id='email' ref={e => e && (this.email = findDOMNode(e))} required />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                        <label htmlFor='password' className='input-group-text Login__label'>Password</label>
                      </InputGroupAddon>
                      <Input type='password' name='password' id='password' ref={e => e && (this.password = findDOMNode(e))} required />
                    </InputGroup>
                  </FormGroup>
                </div>
              }

              {
                showCode &&
                <div className='Login__code' onTransitionEnd={this.onTransitionEnd}>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                        <label htmlFor='code' className='input-group-text Login__label'>Code</label>
                      </InputGroupAddon>
                      <Input type='code' name='code' id='code' ref={e => e && (this.code = findDOMNode(e))} />
                    </InputGroup>
                  </FormGroup>
                  <button type='button' className='link' onClick={() => this.goBack()}><Icon name='caret-left' /> Back</button>
                </div>
              }
            </div>

          </Col>
        </Row>
        <Row>
          <Col sm={{ size: 6, offset: 3 }} className='text-center'>
            <Button loading={auth.isLoading} color='dark'>
              Submit
            </Button>
          </Col>
        </Row>
        <Row>
          <Col sm={{ size: 6, offset: 3 }}>
            <br/>
            {
              auth.message &&
                <Alert color='danger'>
                  { auth.message }
                </Alert>
            }
          </Col>
        </Row>
      </Container>
    )
  }

  render() {
    const { auth } = this.props

    return (
      <Form className='Login' onSubmit={this.onSubmit}>
        { !auth.initialCheck &&
            <div className='Login__loading'>
              <Icon name='spinner' spin /> Loading
            </div>
        }
        { auth.initialCheck &&
            this.renderContent()
        }
      </Form>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
