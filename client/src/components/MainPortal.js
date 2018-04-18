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

import { CONTACT_EMAIL, ENTITIES, DONOR_COLUMNS } from '../constants';
import { select, deselectAll, logOut } from '../actions';
import { toggle as toggleVariantSearch } from '../actions/variantSearch';
import { clearErrorMessage, clearWarningMessage } from '../actions/global';
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
  , errorMessage: state.ui.errorMessage
  , warningMessage: state.ui.warningMessage
  , donorsByID: state.data.donors
  , samplesByID: state.data.samples
  , experimentsByID: state.data.experiments
  , donors: Object.values(state.data.donors)
  , samples: Object.values(state.data.samples)
  , experiments: Object.values(state.data.experiments)
  , auth: state.auth
  , isVariantSearchOpen: state.variantSearch.open
  , variantSearchResults: state.variantSearch.results
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ clearErrorMessage, clearWarningMessage, select, deselectAll, logOut, toggleVariantSearch }, dispatch)

class MainPortal extends Component {

  render() {
    const {
      auth,
      donorsByID,
      samplesByID,
      experimentsByID,
      donors,
      samples,
      experiments,
      selection,
      search,
      errorMessage,
      warningMessage,
      isVariantSearchOpen,
      variantSearchResults,
      toggleVariantSearch,
      clearErrorMessage,
      clearWarningMessage,
    } = this.props

    if (!auth.isLoggedIn)
      return this.renderLogin()


    const selectedDonors = filterSelected(donors, selection.donors)

    let filtered = {
      donors: filterVisibleDonors(donors, selection, search),
      samples: samples,
      experiments: experiments,
    }

    if (isVariantSearchOpen && variantSearchResults.length > 0)
      filtered = filterVariantSearch(variantSearchResults, filtered)

    const visibleAndSelectedDonors = filterSelected(filtered.donors, selection.donors)
    const visibleSamples = visibleAndSelectedDonors.map(d => d.samples.map(id => samplesByID[id])).reduce((acc, cur) => acc.concat(cur), [])
    const selectedSamples = filterSelected(samples, selection.samples)
    const visibleAndSelectedSamples = filterSelected(visibleSamples, selection.samples)
    const selectedExperiments = visibleAndSelectedSamples.map(s => s.experiments.map(id => experimentsByID[id])).reduce((acc, cur) => acc.concat(cur), [])

    filtered.samples = intersection(filtered.samples, visibleSamples)
    filtered.experiments = intersection(filtered.experiments, selectedExperiments)


    const selectedDonorsCount = selection.donors.length === 0 ? 0 : selectedDonors.length
    const hasSelectedButNotVisibleDonors =
      selection.donors.length > 0 &&
      selectedDonors.filter(x => !filtered.donors.includes(x)).length > 0

    const selectedSamplesCount = selection.samples.length === 0 ? 0 : selectedSamples.length
    const hasSelectedButNotVisibleSamples =
      selection.samples.length > 0 &&
      selectedSamples.filter(x => !filtered.samples.includes(x)).length > 0

    return (
      <Container className='MainPortal'>
        <Charts />

        {
          errorMessage &&
          <Alert color='danger' toggle={clearErrorMessage}>
            <h4 className='alert-heading'>Snap! An error occured</h4>
            <p>
              Message: { errorMessage }
            </p>
            <hr />
            <p className='mb-0'>
              <a href={`mailto:${CONTACT_EMAIL}`} className='alert-link'>Contact us</a> if the issue persists.
            </p>
          </Alert>
        }

        {
          warningMessage &&
          <Alert color='warning' toggle={clearWarningMessage}>
            <h4 className='alert-heading'>Oh! Some warning occured</h4>
            <p>
              Message: { warningMessage }
            </p>
            <hr />
            <p className='mb-0'>
              <a href={`mailto:${CONTACT_EMAIL}`} className='alert-link'>Contact us</a> if the issue persists.
            </p>
          </Alert>
        }

        <br/>

        <Row>
          <Col sm={{ size: 6 }}>
            <h4 className='tableTitle'>
              { donors.length } donors{' '}
              <span className='text-muted'>
                (<span className={hasSelectedButNotVisibleDonors ? 'text-danger' : ''}>{ selectedDonorsCount } selected</span>, { filtered.donors.length } visible)
              </span>{' '}
              {
                selection[ENTITIES.DONORS].length > 0 &&
                  <Button
                    size='sm'
                    onClick={() => this.props.deselectAll(ENTITIES.DONORS)}
                  >
                    Clear Selection
                  </Button>
              }
            </h4>
          </Col>
          <Col sm={{ size: 6 }}>
            <ButtonToolbar className='justify-content-end'>
              <ButtonGroup className='mr-2'>
                <SearchInput />
              </ButtonGroup>{' '}
              <ButtonGroup>
                <Button
                  active={isVariantSearchOpen}
                  iconAfter={ isVariantSearchOpen ? 'caret-up' : 'caret-down' }
                  onClick={toggleVariantSearch}
                >
                  Search Variant
                </Button>
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
            <h4 className='tableTitle'>
              { samples.length } samples{' '}
              <span className='text-muted'>
                (<span className={hasSelectedButNotVisibleSamples ? 'text-danger' : ''}>{ selectedSamplesCount } selected</span>, { filtered.samples.length } visible)
              </span>{' '}
              {
                selection[ENTITIES.SAMPLES].length > 0 &&
                  <Button
                    size='sm'
                    onClick={() => this.props.deselectAll(ENTITIES.SAMPLES)}
                  >
                    Clear Selection
                  </Button>
              }
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
            <div className='text-muted'>
              Click on a row to expand the experiment
            </div>
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

function filterSelected(items, selection) {
  // Filter only selected items, but show all if none are selected
  if (selection.length === 0)
    return items

  return items.filter(d => selection.includes(d['id']))
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
  const bi = new Set(b.map(x => x.id))
  return a.filter(x => bi.has(x.id))
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPortal);
