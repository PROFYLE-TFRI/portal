/*
 * VariantSearch.js
 */


import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Label from 'reactstrap/lib/Label';

import AutocompleteInput from './AutocompleteInput';
import Button from './Button';
import Input from './Input';

import { setPosition, setChrom, setStart, setEnd, search, clear } from '../actions/variantSearch';
import { setSearch as setGeneSearch, searchByName } from '../actions/gene';




const mapStateToProps = state => ({
  variantSearch: state.variantSearch,
  genes: state.genes,
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ setGeneSearch, searchByName, setPosition, setChrom, setStart, setEnd, search, clear }, dispatch)

class VariantSearch extends Component {

  onSubmitGene = (ev) => {
    ev.preventDefault()
  }

  onSubmitSearch = (ev) => {
    ev.preventDefault()
    this.props.search()
  }

  onChangeGene = (value) => {
    this.props.searchByName(value)
  }

  onAcceptGene = (gene) => {
    this.props.setGeneSearch(gene.name)
    this.props.setPosition(gene)
    this.props.search()
  }

  render() {
    const {
      variantSearch,
      genes,
      setChrom,
      setStart,
      setEnd,
      search,
      clear,
    } = this.props

    return (
      <div className='VariantSearch align-items-center'>
        <Form inline onSubmit={this.onSubmitGene}>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='gene'>Gene</Label>
            <AutocompleteInput
              id='gene'
              placeholder='Gene Name'
              value={genes.search}
              items={genes.data}
              onChange={this.onChangeGene}
              onAccept={this.onAcceptGene}
              renderText={gene => gene.name}
              renderItem={gene =>
                <span className='VariantSearch__gene'>
                  { AutocompleteInput.highlight(gene.name, genes.search) }
                  <span className='VariantSearch__gene__position'>
                    { gene.chrom + ':' + gene.start + ' - ' + gene.end }
                  </span>
                </span>
              }
            />
          </FormGroup>
        </Form>

        <div className='VariantSearch__or'>OR</div>

        <Form inline onSubmit={this.onSubmitSearch}>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='chrom'>Chrom</Label>
            <Input
              type='text'
              id='chrom'
              className='VariantSearch__chrom'
              placeholder='Chrom'
              value={variantSearch.position.chrom}
              onChange={setChrom}
            />
          </FormGroup>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='start'>Start</Label>
            <Input
              type='number'
              id='start'
              className='VariantSearch__start'
              placeholder='Start'
              value={variantSearch.position.start}
              onChange={setStart}
            />
          </FormGroup>
          <FormGroup className='mb-2 mr-sm-2 mb-sm-0'>
            <Label for='end'>End</Label>
            <Input
              type='number'
              id='end'
              className='VariantSearch__end'
              placeholder='End'
              value={variantSearch.position.end}
              onChange={setEnd}
            />
          </FormGroup>

          <div className='VariantSearch__buttons'>
            <Button
              type='submit'
              color='primary'
              className='mr-2'
              loading={variantSearch.isLoading}
              onClick={search}
            >
              Search
            </Button>
            <Button
              type='button'
              color='secondary'
              icon='close'
              onClick={clear}
              disabled={variantSearch.results.length === 0}
            />
          </div>
        </Form>

        <div className='flex-fill' />

        <div className='VariantSearch__matches'>
          {
            variantSearch.didSearch &&

              (
                variantSearch.results.length > 0 ?
                <span className='text-muted'>
                  { variantSearch.results.length } match{ variantSearch.results.length > 1 ? 'es' : '' }
                </span>
                :
                <span className='text-muted'>
                  No results
                </span>
              )
          }
        </div>
      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VariantSearch);
