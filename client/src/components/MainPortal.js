/*
 * MainPortal.js
 */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Alert from 'reactstrap/lib/Alert';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import ButtonToolbar from 'reactstrap/lib/ButtonToolbar';
import Col from 'reactstrap/lib/Col';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';

import { ENTITIES, DONOR_COLUMNS } from '../constants';
import { select, deselectAll, logOut } from '../actions';
import { toggle as toggleVariantSearch } from '../actions/variantSearch';
import Button from './Button';
import Charts from './Charts';
import DonorTable from './DonorTable';
import ExperimentModal from './ExperimentModal';
import ExperimentTable from './ExperimentTable';
import SampleTable from './SampleTable';
import SearchInput from './SearchInput';
import VariantSearch from './VariantSearch';


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
  , isVariantSearchOpen: state.variantSearch.open
  , variantSearchResults: state.variantSearch.results
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ select, deselectAll, logOut, toggleVariantSearch }, dispatch)

class MainPortal extends Component {

  render() {
    const {
      auth,
      donors,
      samples,
      experiments,
      selection,
      search,
      message,
      isVariantSearchOpen,
      variantSearchResults,
      toggleVariantSearch,
    } = this.props

    if (!auth.isLoggedIn)
      return this.renderLogin()


    const selectedDonors = filterSelectedDonors(donors, selection, search)

    let filtered = {
      donors: filterVisibleDonors(donors, selection, search),
      samples: samples,
      experiments: experiments,
    }

    if (isVariantSearchOpen && variantSearchResults.length > 0)
      filtered = filterVariantSearch(variantSearchResults, filtered)

    const visibleAndSelectedDonors = filterSelectedDonors(filtered.donors, selection, search)
    const visibleSamples = visibleAndSelectedDonors.map(d => Object.values(d.samples)).reduce((acc, cur) => acc.concat(cur), [])
    const selectedExperiments = visibleSamples.map(s => Object.values(s.experiments)).reduce((acc, cur) => acc.concat(cur), [])

    filtered.samples = intersection(filtered.samples, visibleSamples)
    filtered.experiments = intersection(filtered.experiments, selectedExperiments)


    const selectedDonorsCount = selection.donors.length === 0 ? 0 : selectedDonors.length

    const hasSelectedButNotVisibleDonors =
      selection.donors.length > 0 &&
      selectedDonors.filter(x => !filtered.donors.includes(x)).length > 0

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
          <Col sm={{ size: 7 }}>
            <h4>
              { donors.length } donors{' '}
              <span className='text-muted'>
                (<span className={hasSelectedButNotVisibleDonors ? 'text-danger' : ''}>{ selectedDonorsCount } selected</span>, { filtered.donors.length } visible)
              </span>{' '}
              <Button
                size='sm'
                onClick={() => this.props.deselectAll(ENTITIES.DONORS)}
              >
                Clear Selection
              </Button>
            </h4>
          </Col>
          <Col sm={{ size: 5 }}>
            <ButtonToolbar className='justify-content-end'>
              <ButtonGroup className='mr-2'>
                <SearchInput />
              </ButtonGroup>{' '}
              <ButtonGroup>
                <Button
                  active={isVariantSearchOpen}
                  icon='caret-down'
                  onClick={toggleVariantSearch}
                />
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Row>
        {
          isVariantSearchOpen &&
            <Row>
              <Col className='MainPortal__variantSearch'>
                <VariantSearch />
              </Col>
            </Row>
        }

        <br/>

        <DonorTable donors={filtered.donors} />

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

        <SampleTable samples={filtered.samples} />

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

        <ExperimentTable experiments={filtered.experiments} />

        <ExperimentModal />

      </Container>
    )
  }
}


function filterVariantSearch(results, { donors, samples, experiments }) {
  const selection = {
    donors: new Set(),
    samples: new Set(),
    experiments: new Set(),
  }
  results.forEach(result => {
    selection.donors.add(result.donorID)
    selection.samples.add(result.sampleID)
    selection.experiments.add(result.experimentID)
  })

  return {
    donors: donors.filter(d => selection.donors.has(d.id)),
    samples: samples.filter(d => selection.samples.has(d.id)),
    experiments: experiments.filter(d => selection.experiments.has(d.id)),
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

function intersection(a, b) {
  return a.filter(x => b.includes(x))
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPortal);
