import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Row, Col, Alert } from 'reactstrap';

import { DONOR_COLUMNS } from '../constants';
import { select, deselect, logOut } from '../actions';
import Charts from './Charts';
import DonorTable from './DonorTable';
import ExperimentTable from './ExperimentTable';
import IGVBrowser from './IGVBrowser';
import SampleTable from './SampleTable';
import SearchInput from './SearchInput';

const columns = DONOR_COLUMNS.map(c => c.field)


const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , search: state.ui.search
  , message: state.ui.message
  , donors: Object.values(state.data.donors)
  , samples: Object.values(state.data.samples)
  , experiments: Object.values(state.data.experiments)
  , auth: state.auth
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ select, deselect, logOut }, dispatch)

class MainPortal extends Component {

  handleClick(which, ev) {
    const value = ev.payload.name
    if (this.props.selection[which].has(value))
      this.props.deselect(which, value)
    else
      this.props.select(which, value)
  }

  render() {
    const {
      auth,
      donors,
      samples,
      experiments,
      selection,
      search,
      message
    } = this.props

    if (!auth.isLoggedIn)
      return this.renderLogin()


    const visibleDonors = filterVisibleDonors(donors, selection, search)
    const selectedDonors = filterSelectedDonors(donors, selection, search)

    const selectedSamples = visibleDonors.map(d => Object.values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])
    const selectedExperiments = selectedSamples.map(s => Object.values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedDonorsCount = selection.donors.size === 0 ? 0 : selectedDonors.length

    return (
      <Container className='MainPortal'>
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
              { donors.length } donors <span className='text-muted'>
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

        <Row>
          <Col>
            <h4>
              { samples.length } samples <span className='text-muted'>
                ({ selectedSamples.length } visible)
              </span>
            </h4>
          </Col>
        </Row>

        <br/>

        <SampleTable samples={selectedSamples} />

        <Row>
          <Col>
            <h4>
              { experiments.length } experiments <span className='text-muted'>
                ({ selectedExperiments.length } visible)
              </span>
            </h4>
          </Col>
        </Row>

        <br/>

        <ExperimentTable experiments={selectedExperiments} />

      </Container>
    )
  }
}


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

    return hasValue
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPortal);
