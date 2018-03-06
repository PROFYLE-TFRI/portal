/*
 * ExperimentTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import cx from 'classname';


import { renderColumn } from '../helpers/table';
import { EXPERIMENT_COLUMNS } from '../constants';

const { values } = Object





const mapStateToProps = state => ({
    donors: values(state.data.donors)
  , selected: [...state.ui.selection.donors]
})
const mapDispatchToProps = dispatch => ({
})
class ExperimentTable extends Component {
  constructor() {
    super()

    this.renderSteps = this.renderSteps.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    this.stepsToScrollIntoView = {}

    this.state = {
      popoverOpen: false,
      popoverTarget: document.body,
      popoverData: undefined
    }
  }

  componentDidUpdate() {
    // We scroll into view the step-in-progress, but only once.
    // When step === true, it means we have already scrolled it once
    Object.entries(this.stepsToScrollIntoView).forEach(([ id, step ]) => {
      if (step === true || step === null)
        return
      const scrollArea = step.parentElement
      const scrollBox = scrollArea.getBoundingClientRect()
      scrollArea.scrollLeft = step.offsetLeft - scrollBox.left - scrollBox.width / 2
      this.stepsToScrollIntoView[id] = true
    })
  }

  openPopover(target, step) {
    this.setState({
      popoverOpen: true,
      popoverTarget: target,
      popoverData: step
    })
  }

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    })
  }

  render() {

    const { experiments } = this.props

    const options = {
      sizePerPage: 15,
      hideSizePerPage: true
    }

    return (
      <div className='ExperimentTable table-sm'>
        <Table data={experiments} version='4'
            options={options}
            pagination={true}
        >
          {
            EXPERIMENT_COLUMNS.map(renderColumn)
          }
          <Header dataFormat={this.renderSteps}
                  className='ExperimentTable__stepsHeader'
            columnClassName='ExperimentTable__stepsColumn' >
            Steps
          </Header>
        </Table>

        { this.renderPopover() }
      </div>
    )
  }

  renderPopover() {
    const { popoverOpen, popoverTarget, popoverData } = this.state

    if (!popoverData)
      return undefined

    const generalInformation = popoverData.analysis.pipeline.general_information
    const step = popoverData.step
    const name = step.name
    const jobs = step.job

    return <Popover key={popoverTarget}
      placement='bottom'
      isOpen={popoverOpen}
      target={popoverTarget}
      toggle={this.togglePopover}
    >
      <PopoverHeader>Jobs for { name }</PopoverHeader>
      <PopoverBody>
        <table className='table table-sm'>
          <tbody>
            <tr><th>Assembly Used</th><td>{ generalInformation.assembly_used }</td></tr>
            <tr><th>Assembly Source</th><td>{ generalInformation.assembly_source }</td></tr>
            <tr><th>Analysis Folder</th><td>{ generalInformation.analysis_folder }</td></tr>
            <tr><th>HPC Center</th><td>{ generalInformation.hpc_center }</td></tr>
            <tr><th>DBSNP Version</th><td>{ generalInformation.dbsnp_version }</td></tr>
            <tr><th>Analysed Species</th><td>{ generalInformation.analysed_species }</td></tr>
            <tr><th>Pipeline Version</th><td>{ generalInformation.pipeline_version }</td></tr>
          </tbody>
        </table>
        <div className='Popover__scrollArea'>
          <div class='list-group'>
            {
              jobs.map(job =>
                <div key={job.id} class='list-group-item flex-column align-items-start'>
                  <div class='d-flex w-100 justify-content-between'>
                    <h5 class='mb-1'>{ job.id }</h5>
                    <small>{ job.job_start_date || '' } - { job.job_end_date || '' }</small>
                  </div>
                  <p class='mb-1 job__command'>
                    { job.command.split('&&').map((cmd, i) => <span>{ (i ? '&&' : '   ') + cmd }<br/></span>) } 
                  </p>
                  <small>Status: { job.status }</small>
                </div>
              )
            }
          </div>
        </div>
      </PopoverBody>
    </Popover>
  }

  renderSteps(cell, experiment) {
    if (!experiment || !experiment.analysis)
      return (
        <div className='steps steps--empty'>
          <em>No steps</em>
        </div>
      )

    const steps = experiment.analysis.pipeline.step

    return <div className='steps'>
      {
        steps.map((step, i) => {
          const id = ['step', experiment.sample_id, experiment.name, i].join('__')

          const jobs = step.job
          const name = step.name
          const endDate = getLastEndDate(jobs)

          const isDone = jobs.every(hasEnded)
          const inProgress = jobs.some(isRunning)
          const notStarted = !inProgress && jobs.every(job => job.job_end_date === undefined)

          const className = cx(
              'step',
            { 'step--success': jobs.every(job => job.status === 'success') },
            { 'step--warning': jobs.some(job => job.status === 'warning') },
            { 'step--error':   jobs.some(job => job.status === 'error') },
            { 'step--in-progress': inProgress },
            { 'step--not-started': notStarted },
            { 'step--active': this.state.popoverOpen && id === this.state.popoverTarget },
          )

          // We need to scroll to the last done/in-progress job, thus we attach a ref
          const onRef = !(inProgress || isDone) ? undefined : ref => {
            if (this.stepsToScrollIntoView[experiment.id] !== true)
              this.stepsToScrollIntoView[experiment.id] = ref
          }

          const openPopover = () =>
            this.openPopover(id, { step, analysis: experiment.analysis })

          return <div key={id} id={id} className={className} onClick={openPopover} ref={onRef}>
            <div className='step__dot' />
            <div className='step__name' title={name}>{name}</div>
            <div className='step__details text-muted'>
              { endDate }
            </div>
          </div>
        })
      }
    </div>
  }

}

function isRunning(job) {
  return ('job_start_date' in job) && !('job_end_date' in job)
}

function hasEnded(job) {
  return 'job_end_date' in job
}

function getLastEndDate(jobs) {
  const result = jobs.reduce((acc, job) => {
    if (!job.job_end_date)
      return acc
    const d = new Date(job.job_end_date)
    if (d > acc)
      return d
    return acc
  }, 0)
  return result === 0 ? undefined : result.toLocaleString()
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExperimentTable);
