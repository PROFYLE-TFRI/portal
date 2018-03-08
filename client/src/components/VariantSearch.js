/*
 * VariantSearch.js
 */


import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Label from 'reactstrap/lib/Label';
import { compose } from '../helpers/rambda';

import Button from './Button';
import Input from './Input';
import * as Actions from '../actions/variantSearch';




const mapStateToProps = state => ({
  variantSearch: state.variantSearch
})
const mapDispatchToProps = dispatch =>
  bindActionCreators(Actions, dispatch)

class VariantSearch extends Component {

  render() {

    const {
      variantSearch,
      setChrom,
      setStart,
      setEnd,
      search,
      clear,
    } = this.props

    return (
      <div className='VariantSearch align-items-center'>
        <Form inline>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='chrom' className='mr-sm-2 sr-only'>Chrom</Label>
            <Input
              type='text'
              id='chrom'
              placeholder='Chrom'
              value={variantSearch.params.chrom}
              onChange={setChrom}
            />
          </FormGroup>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='start' className='mr-sm-2 sr-only'>Start</Label>
            <Input
              type='number'
              id='start'
              placeholder='Start'
              value={variantSearch.params.start}
              onChange={setStart}
            />
          </FormGroup>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='end' className='mr-sm-2 sr-only'>End</Label>
            <Input
              type='number'
              id='end'
              placeholder='End'
              value={variantSearch.params.end}
              onChange={setEnd}
            />
          </FormGroup>
        </Form>

        <Button
          color='primary'
          className='mr-2'
          loading={variantSearch.isLoading}
          onClick={search}
        >
          Search
        </Button>
        <Button
          color='secondary'
          icon='close'
          onClick={clear}
        />

        <div className='flex-fill' />

        {
          variantSearch.results.length > 0 &&
            <span className='text-muted'>
              { variantSearch.results.length } match{ variantSearch.results.length > 1 ? 'es' : '' }
            </span>
        }
      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VariantSearch);
