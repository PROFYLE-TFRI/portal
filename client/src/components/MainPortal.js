import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Container, Row, Col, Alert } from 'reactstrap';

import { ENTITIES, DONOR_COLUMNS } from '../constants';
import { select, deselectAll, logOut } from '../actions';
import Button from './Button';
import Charts from './Charts';
import DonorTable from './DonorTable';
import ExperimentModal from './ExperimentModal';
import ExperimentTable from './ExperimentTable';
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
  bindActionCreators({ select, deselectAll, logOut }, dispatch)

class MainPortal extends Component {

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
    const visibleAndSelectedDonors = filterSelectedDonors(visibleDonors, selection, search)

    const visibleSamples = visibleAndSelectedDonors.map(d => Object.values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])
    const selectedExperiments = visibleSamples.map(s => Object.values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    const selectedDonorsCount = selection.donors.length === 0 ? 0 : selectedDonors.length

    const hasSelectedButNotVisibleDonors =
      selection.donors.length > 0 &&
      selectedDonors.filter(x => !visibleDonors.includes(x)).length > 0

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
              { donors.length } donors{' '}
              <span className='text-muted'>
                (<span className={hasSelectedButNotVisibleDonors ? 'text-danger' : ''}>{ selectedDonorsCount } selected</span>, { visibleDonors.length } visible)
              </span>{' '}
              <Button
                size='sm'
                onClick={() => this.props.deselectAll(ENTITIES.DONORS)}
              >
                Clear Selection
              </Button>
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
                ({ visibleSamples.length } visible)
              </span>
            </h4>
          </Col>
        </Row>

        <br/>

        <SampleTable samples={visibleSamples} />

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

        <ExperimentModal />

      </Container>
    )
  }
}


function filterSelectedDonors(donors, selection) {
  // Filter only selected donors, but show all if none are selected
  if (selection.donors.length === 0)
    return donors

  return donors.filter(d => selection.donors.includes(d['id']))
}

function filterVisibleDonors(donors, selection, search) {
  const terms = search.split(' ').filter(v => v !== '')

  return donors.filter(d => {

    if (selection.provinces.length > 0 &&
        !selection.provinces.includes(d['recruitement_team.province']))
      return false

    if (selection.diseases.length > 0 &&
        !selection.diseases.includes(d['disease']))
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
