import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Table, Row, Col, Alert, Input, Label, Form, FormGroup, } from 'reactstrap';

import Button from './Button'

import asString from '../helpers/as-string'
import * as Peer from '../actions/peer';
import * as PeerUtils from '../helpers/peer'
import getDiffObject from '../helpers/get-diff-object'


const ACTIONS = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
}

const mapStateToProps = state => ({
  peers: state.peers
})
const mapDispatchToProps = dispatch =>
  bindActionCreators(Peer, dispatch)

class PeerPortal extends Component {
  state = {
    action: undefined,
    peerID: undefined,
  }

  onCancel = () => {
    this.setState({ action: undefined, peerID: undefined })
  }

  onAccept = (newPeer) => {
    let action

    if (this.state.action === ACTIONS.CREATE) {
      action = this.props.create(newPeer)
    } else {
      const peer = this.props.peers.data.find(u => u.id === this.state.peerID)
      const diff = getDiffObject(peer, newPeer)
      action = this.props.update(diff)
    }

    action.then(() => this.setState({ action: undefined, peerID: undefined }))
  }

  render() {
    const { peers } = this.props
    const { action, peerID } = this.state

    return (
      <Container className='PeerPortal'>
        {
          peers.message &&
          <Alert color='danger'>
            <h4 className='alert-heading'>
              An error occured:
            </h4>
            <p>
              { asString(peers.message) }
            </p>
          </Alert>
        }
        <Table className='PeerPortal__table'>
          <thead>
            <tr>
              <th>#</th>
              <th>URL</th>
              <th>API Key</th>
              <th>Active?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              peers.data.map(peer =>
                action === ACTIONS.EDIT && peerID === peer.id ?
                  <EditRow peer={peer} onAccept={this.onAccept} onCancel={this.onCancel} />
                :
                  <tr key={peer.id}>
                    <th scope='row'>{ peer.id }</th>
                    <td>{ peer.url }</td>
                    <td>{ peer.apiKey }</td>
                    <td>{ peer.isActive.toString() }</td>
                    <td>
                      <Button
                        icon='edit'
                        outline
                        color='warning'
                        size='sm'
                        onClick={() => this.setState({ action: ACTIONS.EDIT, peerID: peer.id })}
                      /> <Button
                        icon='trash'
                        outline
                        color='danger'
                        size='sm'
                        onClick={() => this.props.remove(peer.id)}
                      />
                    </td>
                  </tr>
              )
            }

            {
              action === ACTIONS.CREATE &&
                <EditRow peer={{ permissions: [] }} onAccept={this.onAccept} onCancel={this.onCancel} />
            }

          </tbody>
        </Table>

        <Button
          icon='plus'
          outline
          color='success'
          size='sm'
          loading={peers.isLoading}
          onClick={() => this.setState({ action: ACTIONS.CREATE })}
        >
          Create New Peer
        </Button>
      </Container>
    )
  }
}

class EditRow extends React.Component {
  constructor(props) {
    super(props)
    const { peer = PeerUtils.createNew() } = props
    this.state = PeerUtils.deserialize(peer)
  }

  componentWillReceiveProps({ peer = PeerUtils.createNew() }) {
    this.setState(PeerUtils.deserialize(peer))
  }

  onClickAccept = () => {
    const peer = PeerUtils.serialize(this.state)
    this.props.onAccept(peer)
  }

  render() {
    const { peer, onCancel } = this.props

    return (
      <tr>
        <th scope='row'>{ peer.id }</th>
        <td><Input type='text'     name='url'      defaultValue={peer.url}        onChange={ev => this.setState({ url:      ev.target.value   })} /></td>
        <td><Input type='text'     name='apiKey'   defaultValue={peer.apiKey}     onChange={ev => this.setState({ apiKey:   ev.target.value   })} /></td>
        <td><input type='checkbox' name='isActive' defaultChecked={peer.isActive} onChange={ev => this.setState({ isActive: ev.target.checked })} /></td>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeerPortal);
