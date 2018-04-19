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

const mapStateToProps = state => {
  const experiment = state.data.experiments[state.ui.selection.experiment]
  const sample = experiment ? state.data.samples[experiment.sample_id] : undefined
  const donor = sample ? state.data.donors[sample.donorID] : undefined
  const source = donor ? donor.source : undefined

  const files = []
  if (donor)
    donor.samples.forEach(sampleID => {
      state.data.samples[sampleID].experiments.forEach(experimentID => {
        files.push(...state.data.experiments[experimentID].alignments)
      })
    })

  return {
    source: source,
    files: files,
    experiment: experiment,
    variantSearchResults: state.variantSearch.results,
  }
}
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
      this.state.selectedFiles = props.experiment.alignments.reduce((acc, cur) => { acc[cur] = true; return acc }, {})
      /* eslint-enable react/no-direct-mutation-state */
    }
  }

  componentWillReceiveProps(props) {
    const { experiment, variantSearchResults, files } = props
    if (experiment) {

      const variants = mergeResults(variantSearchResults.filter(result => result.experimentID === experiment.id))
      const locus = variants.length > 0 ? getPositionAround(variants[0]) : DEFAULT_LOCUS

      this.setState({
        experiment: experiment,
        selectedFiles: files.reduce((acc, cur) => { acc[cur] = true; return acc }, {}),
        variants: variants,
        locus: locus,
      })
    }
    else {

      this.setState({
        experiment: {},
        selectedFiles: {},
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
    const { source } = this.props

    const selectedEntries = Object.entries(selectedFiles)
    const tracks = selectedEntries
      .filter(([file, selected]) => selected)
      .map(([file, _]) => {
        const name = file
        const url = `/files/${source}/${file}`
        const indexURL = url.replace(/\.bam$/, '.bai')
        return { name, url, indexURL }
      })

    const variantsByPosition = groupBy(getPosition, variants)
    const variantsByPositionEntries = Object.entries(variantsByPosition)

    return (
      <ModalBody>
        <div className='title'>
          Informations
        </div>

        <Container className='ExperimentModal__informations'>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Sample
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.sample_id)}</Col>
            <Col className='ExperimentModal__label' xs='2'>
              Type
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Experiment Type
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.experiment_type)}</Col>
            <Col className='ExperimentModal__label' xs='2'>
              Assay Type
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.assay_type)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Protocol Type
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.protocol_type)}</Col>
            <Col className='ExperimentModal__label' xs='2'>
              Seq. Center
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='4'>{JSON.stringify(experiment.sequencing_center)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Data Source
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='9'>{JSON.stringify(source)}</Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Raw Data
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='10'>
              <pre>
                {JSON.stringify(experiment.raw_data)}
              </pre>
            </Col>
          </Row>
          <Row>
            <Col className='ExperimentModal__label' xs='2'>
              Analysis
            </Col>{' '}
            <Col className='ExperimentModal__value' xs='10'>
              <pre>
                {JSON.stringify(experiment.analysis)}
              </pre>
            </Col>
          </Row>
        </Container>

        <br/>

        {
          selectedEntries.length > 0 &&
            <div>
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

            </div>
        }

        {
          variantsByPositionEntries.length > 0 &&
            <div>
              <div className='title'>
                Variants
              </div>

              <ListGroup>
              {
                variantsByPositionEntries.map(([position, variants], i) =>
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
            </div>
        }

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
