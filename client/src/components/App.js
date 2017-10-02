import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
import { compose } from 'ramda';

import { OPAQUE_SELECTION_COLOR, COLORS } from '../constants';
import { select, deselect } from '../actions';
import './App.css';
import Charts from './Charts';
import DonorTable from './DonorTable';
import SampleTable from './SampleTable';
import ExperimentTable from './ExperimentTable';

const { keys, values, entries } = Object




const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
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

    const { donors, selection } = this.props

    // Filter only selected donors, but show all if none are selected
    const selectedDonors = selection.donors.size > 0 ? donors.filter(d => selection.donors.has(d.id)) : donors

    const selectedSamples = selectedDonors.map(d => values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedExperiments = selectedSamples.map(s => values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    return (
      <div className="App">

        <Charts />

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
