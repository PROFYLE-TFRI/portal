/*
 * ExperimentModal.js
 */
/* eslint react/prop-types: 0 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem } from 'reactstrap';

import Button from './Button'
import Icon from './Icon'
import IGVBrowser from './IGVBrowser'
import { deselectExperiment } from '../actions'



const mapStateToProps = state => ({
  experiment: state.data.experiments[state.ui.selection.experiment]
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ deselectExperiment }, dispatch)

class ExperimentModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      experiment: undefined,
      selectedFiles: {},
    }

    if (props.experiment) {
      this.state.experiment = props.experiment
      this.state.selectedFiles = props.experiment.alignments.reduce((acc, cur) => (acc[cur] = true, acc), {})
    }
  }

  componentWillReceiveProps(props) {
    const { experiment } = props
    if (experiment)
      this.setState({
        experiment: experiment,
        selectedFiles: experiment.alignments.reduce((acc, cur) => (acc[cur] = true, acc), {}),
      })
  }

  toggleSelection(file) {
    this.setState({
      selectedFiles: {
        ...this.state.selectedFiles,
        [file]: !this.state.selectedFiles[file]
      }
    })
  }

  renderBody() {
    const { experiment = {}, selectedFiles } = this.state

    const selectedEntries = Object.entries(selectedFiles)

    return (
      <ModalBody>
        <div className='title'>
          Informations
        </div>

        <Container className='ExperimentModal__informations'>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Sample
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.sample_id)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Type
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Experiment Type
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.experiment_type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Assay Type
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.assay_type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Protocol Type
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.protocol_type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Seq. Center
            </Col>{' '}
            <Col className='ExperimentModal__value'>{JSON.stringify(experiment.sequencing_center)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Raw Data
            </Col>{' '}
            <Col className='ExperimentModal__value'>
              <pre>
                {JSON.stringify(experiment.raw_data)}
              </pre>
            </Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='4'>
              Analysis
            </Col>{' '}
            <Col className='ExperimentModal__value'>
              <pre>
                {JSON.stringify(experiment.analysis)}
              </pre>
            </Col>
          </Row>
        </Container>

        <br/>

        <div className='title'>
          Files
        </div>

        <ListGroup>
          {
            selectedEntries.map(([file, selected]) =>
              <ListGroupItem
                key={file}
                tag='button'
                action
                onClick={() => this.toggleSelection(file)}
              >
                <Icon name={selected ? 'check-square-o' : 'square-o' } className='list-icon' /> <Icon name='file' /> { file }
              </ListGroupItem>
            )
          }
        </ListGroup>

        <br/>

        <IGVBrowser
          reference={{ id: 'hg19' }}
          locus='chr1:1-15,000'
          trackDefaults={{ alignment: { height: 150 } }}
          tracks={
            selectedEntries
              .filter(([file, selected]) => selected)
              .map(([file, _]) => ({
                name: (file.match(/[^/]+$/) || [file])[0],
                url: `/files/${file}`
              }))
          }
          showGenes={true}
        />

      </ModalBody>
    )
  }

  render() {
    const isOpen = this.props.experiment !== undefined
    const { experiment } = this.state

    return (
      <Modal isOpen={isOpen} toggle={this.props.deselectExperiment} size='lg'>
        <ModalHeader toggle={this.toggle}>Experiment { experiment ? experiment.id : undefined }</ModalHeader>
        { experiment ? this.renderBody() : undefined }
        <ModalFooter>
          <Button color='secondary' onClick={this.props.deselectExperiment}>Close</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExperimentModal);
