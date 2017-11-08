import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell } from 'recharts';
import { Container, Row, Col, Alert } from 'reactstrap';
import { compose } from 'ramda';

import { OPAQUE_SELECTION_COLOR, COLORS, DONOR_COLUMNS } from '../constants';
import { select, deselect } from '../actions';
import './App.css';
import SearchInput from './SearchInput';
import Charts from './Charts';
import DonorTable from './DonorTable';
import SampleTable from './SampleTable';
import ExperimentTable from './ExperimentTable';

const { keys, values, entries } = Object

const columns = DONOR_COLUMNS.map(c => c.field)



function filterSelectedDonors(donors, selection) {
  // Filter only selected donors, but show all if none are selected
  if (selection.donors.size === 0)
    return donors

  return donors.filter(d => selection.donors.has(d['id']))
}

function filterVisibleDonors(donors, selection, search) {
  const terms = search.split(' ').filter(v => v !== '')

  return donors.filter(d => {

    if (selection.provinces.size > 0 &&
        !selection.provinces.has(d['recruitement_team.province']))
      return false

    if (selection.diseases.size > 0 &&
        !selection.diseases.has(d['disease']))
      return false

    if (search && !terms.every(term => columns.some(columnContains(d, term))))
      return false

    return true
  })
}

function columnContains(d, term) {
  return field => {
    if (d[field] === null)
      return false

    const hasUpperCase = /[A-Z]/.test(term)
    const value = hasUpperCase ? (d[field] + '') : (d[field] + '').toLowerCase()
    const hasValue = value.includes(term)

    console.log(field, value, term, hasValue)

    return hasValue
  }
}


const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , search: state.ui.search
  , message: state.ui.message
  , donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
    select: compose(dispatch, select)
  , deselect: compose(dispatch, deselect)
})
class App extends Component {

  handleClick(which, ev) {
    const value = ev.payload.name
    if (this.props.selection[which].has(value))
      this.props.deselect(which, value)
    else
      this.props.select(which, value)
  }

  render() {

    const { donors, selection, search, message } = this.props

    const visibleDonors = filterVisibleDonors(donors, selection, search)

    const selectedDonors = filterSelectedDonors(donors, selection, search)

    const selectedSamples = selectedDonors.map(d => values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedExperiments = selectedSamples.map(s => values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedDonorsCount = selection.donors.size === 0 ? 0 : selectedDonors.length

    return (
      <Container className="App">
        <br/>

        <Charts />

        {
          message &&
            <Alert color='danger'>
              <h4 className='alert-heading'>Snap! An error occured</h4>
              <p>
                Message: { message }
              </p>
              <hr />
              <p className='mb-0'>
                <a href='mailto:romain.gregoire@mcgill.ca' className='alert-link'>Contact us</a> if the issue persists.
              </p>
            </Alert>
        }

        <br/>

        <Row>
          <Col sm={{ size: 8 }}>
            <h4>
              { donors.length } donors <span className='text-message'>
                ({ selectedDonorsCount } selected, { visibleDonors.length } visible)
              </span>
            </h4>
          </Col>
          <Col sm={{ size: 4 }}>
            <SearchInput />
          </Col>
        </Row>

        <br/>

        <DonorTable donors={visibleDonors} />

        <SampleTable samples={selectedSamples} />

        <ExperimentTable experiments={selectedExperiments} />

      </Container>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
