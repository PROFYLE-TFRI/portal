/*
 * ExperimentTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { Popover, PopoverTitle, PopoverContent } from 'reactstrap';
import { compose } from 'ramda';
import cx from 'classname';


import { renderColumn } from '../helpers/table';
import { selectDonor, deselectDonor } from '../actions';
import { selectAllDonors, deselectAllDonors } from '../actions';
import { SELECTION_COLOR, EXPERIMENT_COLUMNS } from '../constants';

const { values } = Object





const mapStateToProps = state => ({
    donors: values(state.data.donors)
  , selected: [...state.ui.selection.donors]
})
const mapDispatchToProps = dispatch => ({
    selectDonor:       compose(dispatch, selectDonor)
  , deselectDonor:     compose(dispatch, deselectDonor)
  , selectAllDonors:   compose(dispatch, selectAllDonors)
  , deselectAllDonors: compose(dispatch, deselectAllDonors)
})
class ExperimentTable extends Component {
  constructor() {
    super()

    this.renderSteps = this.renderSteps.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    this.state = {
      popoverOpen: false,
      popoverTarget: document.body,
      popoverData: undefined
    }
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
    const { selectDonor, deselectDonor, selectAllDonors, deselectAllDonors } = this.props

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

    const step = popoverData
    const name = step.name
    const jobs = step.job

    return <Popover key={popoverTarget}
      placement='bottom'
      isOpen={popoverOpen}
      target={popoverTarget}
      toggle={this.togglePopover}
    >
      <PopoverTitle>Jobs for { name }</PopoverTitle>
      <PopoverContent>
        <div class='list-group'>
        {
          jobs.map(job =>
            <div key={job.id} class='list-group-item flex-column align-items-start'>
              <div class='d-flex w-100 justify-content-between'>
                <h5 class='mb-1'>{ job.id }</h5>
                <small>{ job.job_start_date || '' } - { job.job_end_date || '' }</small>
              </div>
              <p class='mb-1 job__command'>
                { job.command }
              </p>
              <small>Status: { job.status }</small>
            </div>
          )
        }
        </div>
      </PopoverContent>
    </Popover>
  }

  renderSteps(cell, experiment) {
    if (!experiment || !experiment.analysis)
      return <em>No steps</em>

    const steps = experiment.analysis.pipeline.step

    return <div className='steps'>
      {
        steps.map((step, i) => {
          const jobs = step.job
          const name = step.name
          const endDate = getLastEndDate(jobs)

          const className = cx(
              'step',
            { 'step--success': jobs.every(job => job.status === 'success') },
            { 'step--warning': false },
            { 'step--error': false },
            { 'step--in-progress': jobs.some(isRunning) },
            { 'step--not-started': jobs.every(job => job.job_end_date === undefined) },
          )

          const id = `step__${experiment.sample_id}__${experiment.name}__${i}`
          const openPopover = () => this.openPopover(id, step)

          return <div className={className}>
            <div id={id} className='step__dot' onClick={openPopover}/>
            <div className='step__name' title={name}>{name}</div>
            <div className='step__details text-message'>
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
