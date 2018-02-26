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

class Login extends Component {

  onSubmit = (ev) => {
    ev.preventDefault()
    const email = this.email.value
    const password = this.password.value
    const code = this.code.value
    this.props.logIn(email, password, code)
  }

  goBack() {
    this.props.requires2fa(false)
    this.code.value = ''
  }

  render() {
    const { auth } = this.props

    return (
      <Form className='Login' onSubmit={this.onSubmit}>
        <Container>
          <Row>
            <Col sm={{ size: 6, offset: 3 }}>
              <h1>Log In</h1>
            </Col>
          </Row>
          <Row>
            <Col sm={{ size: 6, offset: 3 }} className={
              classname('Login__form', { 'Login__form--requires2fa': auth.requires2fa})
            }>

              <div className='Login__credentials'>
                <FormGroup>
                  <InputGroup>
                    <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                      <label for='email' className='input-group-text Login__label'>Email</label>
                    </InputGroupAddon>
                    <Input type='email' name='email' id='email' ref={e => e && (this.email = findDOMNode(e))} required />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                      <label for='password' className='input-group-text Login__label'>Password</label>
                    </InputGroupAddon>
                    <Input type='password' name='password' id='password' ref={e => e && (this.password = findDOMNode(e))} required />
                  </InputGroup>
                </FormGroup>
              </div>

              <div className='Login__code'>
                <FormGroup>
                  <InputGroup>
                    <InputGroupAddon addonType='prepend' className='input-group-prepend'>
                      <label for='code' className='input-group-text Login__label'>Code</label>
                    </InputGroupAddon>
                    <Input type='code' name='code' id='code' ref={e => e && (this.code = findDOMNode(e))} />
                  </InputGroup>
                </FormGroup>
                <a href='#' onClick={() => this.goBack()}><Icon name='caret-left' /> Back</a>
              </div>

            </Col>
          </Row>
          <Row>
            <Col sm={{ size: 6, offset: 3 }} className='text-center'>
              <Button loading={auth.isLoading}>
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
      </Form>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
