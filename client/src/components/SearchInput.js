/*
 * SearchInput.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { compose } from '../helpers/rambda';

import Button from './Button';
import { search } from '../actions';




const mapStateToProps = state => ({
  value: state.ui.search
})
const mapDispatchToProps = dispatch => ({
  search: compose(dispatch, search)
})

class SearchInput extends Component {
  constructor() {
    super()

    this.onChange = this.onChange.bind(this)
    this.onClickClear = this.onClickClear.bind(this)
  }

  onChange(ev) {
    this.props.search(ev.target.value)
  }

  onClickClear(ev) {
    this.props.search('')
  }

  render() {

    const { value } = this.props

    return (
      <InputGroup>
        <Input value={value} placeholder='Filter...' onChange={this.onChange}/>
        <InputGroupAddon addonType='append'>
          <Button
            disabled={value === ''}
            icon='close'
            onClick={this.onClickClear}
          >
            <span className='sr-only'>Clear</span>
          </Button>
        </InputGroupAddon>
      </InputGroup>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchInput);
