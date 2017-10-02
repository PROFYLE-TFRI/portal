import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
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



function filterDonors(donors, selection, search) {
  const terms = search.split(' ').filter(v => v !== '')

  return donors.filter(d => {

    // Filter only selected donors, but show all if none are selected
    if (selection.donors.size > 0 &&
        !selection.donors.has(d['id']))
      return false

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

    const { donors, selection, search } = this.props

    const selectedDonors = filterDonors(donors, selection, search)

    const selectedSamples = selectedDonors.map(d => values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedExperiments = selectedSamples.map(s => values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    return (
      <div className="App">

        <Charts />

        <Row>
          <Col sm={{ size: 4, offset: 8 }}>
            <SearchInput />
          </Col>
        </Row>

        <DonorTable donors={selectedDonors} />

        <SampleTable samples={selectedSamples} />

        <ExperimentTable experiments={selectedExperiments} />

      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
