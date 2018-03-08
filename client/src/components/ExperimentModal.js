/*
 * ExperimentModal.js
 */
/* eslint react/prop-types: 0 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem } from 'reactstrap';

import groupBy from '../helpers/group-by'
import Button from './Button'
import Icon from './Icon'
import IGVBrowser from './IGVBrowser'
import { deselectExperiment } from '../actions'


const DEFAULT_LOCUS = 'chr1:1-15,000'

const mapStateToProps = state => ({
  experiment: state.data.experiments[state.ui.selection.experiment],
  variantSearchResults: state.variantSearch.results,
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ deselectExperiment }, dispatch)

class ExperimentModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      experiment: undefined,
      selectedFiles: {},
      variants: [],
      locus: DEFAULT_LOCUS,
    }

    if (props.experiment) {
      /* eslint-disable react/no-direct-mutation-state */
      this.state.experiment = props.experiment
      this.state.selectedFiles = props.experiment.alignments.reduce((acc, cur) => (acc[cur] = true, acc), {})
      /* eslint-enable react/no-direct-mutation-state */
    }
  }

  componentWillReceiveProps(props) {
    const { experiment, variantSearchResults } = props
    if (experiment) {

      const variants = mergeResults(variantSearchResults.filter(result => result.experimentID === experiment.id))
      const locus = variants.length > 0 ? getPositionAround(variants[0]) : DEFAULT_LOCUS

      this.setState({
        experiment: experiment,
        selectedFiles: experiment.alignments.reduce((acc, cur) => (acc[cur] = true, acc), {}),
        variants: variants,
        locus: locus,
      })
    }
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
    const {
      experiment = {},
      selectedFiles,
      variants,
      locus,
    } = this.state

    const selectedEntries = Object.entries(selectedFiles)
    const tracks = selectedEntries
      .filter(([file, selected]) => selected)
      .map(([file, _]) => ({
        name: (file.match(/[^/]+$/) || [file])[0],
        url: `/files/${file}`
      }))

    const variantsByPosition = groupBy(getPosition, variants)

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
          locus={locus}
          trackDefaults={{ alignment: { height: 150 } }}
          tracks={tracks}
          showGenes={true}
        />

        <div className='title'>
          Variants
        </div>

        <ListGroup>
        {
          Object.entries(variantsByPosition).map(([position, variants], i) =>
            <ListGroupItem key={i} className='ExperimentModal__variant d-flex'>
              <span className='ExperimentModal__position'>
                <Button
                  size='sm'
                  icon='eye'
                  onClick={() => this.setState({ locus: position })}
                />{' '}
                { position }
              </span>
              <ListGroup className='flex-fill'>
                {
                  variants.map((variant, i) =>
                    <ListGroupItem key={i}>
                      { filename(variant.file) } { variant.alt } { variant.ref }
                    </ListGroupItem>
                  )
                }
              </ListGroup>
            </ListGroupItem>
          )
        }
        </ListGroup>

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

function mergeResults(results) {
  return results.reduce((acc, result) =>
    acc.concat(result.variants.map(variant => ({ file: result.file, ...variant }))), [])
}

function getPosition(variant) {
  return `${variant.chrom}:${variant.start}-${variant.end}`
}

function getPositionAround(variant) {
  return `${variant.chrom}:${Number(variant.start) - 100}-${Number(variant.end) + 100}`
}

function filename(filepath) {
  const m = filepath.match(/[^/]+$/)
  if (m)
    return m[0]
  return filepath
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExperimentModal);
