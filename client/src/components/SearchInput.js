/*
 * SearchInput.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { compose } from 'ramda';

import { search } from '../actions';

const { keys, values, entries } = Object




const mapStateToProps = state => ({
  value: state.ui.search
})
const mapDispatchToProps = dispatch => ({
  search: compose(dispatch, search)
})

class App extends Component {
  constructor() {
    super()

    this.onChange = this.onChange.bind(this)
  }

  onChange(ev) {
    this.props.search(ev.target.value)
  }

  render() {

    const { value } = this.props

    return (
      <Input value={value} placeholder='Search...' onChange={this.onChange}/>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
