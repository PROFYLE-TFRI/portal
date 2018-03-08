/*
 * Input.js
 */


import React from 'react';
import { Input as ReactstrapInput } from 'reactstrap'

export default class Input extends React.Component {
  onChange = (ev) => {
    this.props.onChange && this.props.onChange(ev.target.value, ev)
  }

  render() {
    const { onChange,  ...rest } = this.props
    return (
      <ReactstrapInput
        onChange={this.onChange}
        { ...rest }
      />
    )
  }
}
