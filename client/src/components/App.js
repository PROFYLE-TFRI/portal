import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardImg, CardText, CardBlock, CardLink, CardTitle, CardSubtitle } from 'reactstrap';

import './App.css';
import DonorTable from './DonorTable';
import SampleTable from './SampleTable';

const { keys, values } = Object

const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
})

class App extends Component {

  render() {

    const { donors, selection } = this.props

    // Filter only selected donors, but show all if none are selected
    const selectedDonors = selection.donors.size > 0 ? donors.filter(d => selection.donors.has(d.id)) : donors

    const selectedSamples = selectedDonors.map(d => values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])

    return (
      <div className="App">

        <DonorTable />

        <SampleTable samples={selectedSamples} />

      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
