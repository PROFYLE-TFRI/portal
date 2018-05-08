/*
 * Time.jsx
 */

import React from 'react'
import prop from 'prop-types'
import { UncontrolledTooltip } from 'reactstrap'
import cuid from 'cuid'

import humanReadableTime from '../helpers/human-readable-time.js'


export default class Time extends React.Component {
  constructor(props) {
    super(props)
    this.state = { id: undefined }
  }

  componentDidMount() {
    this.setState({ id: cuid() })
  }

  render() {
    const { id } = this.state
    const { value } = this.props

    if (!value)
      return (
        <span className='Time Time--empty'>
          none
        </span>
      )

    const date = new Date(value)
    return (
      <span className='Time'>
        <abbr className='Time__abbr' id={id}>{ humanReadableTime(date) }</abbr>
        {
          id &&
            <UncontrolledTooltip placement="top" target={id}>
              { date.toString() }
            </UncontrolledTooltip>
        }
      </span>
    )
  }
}

Time.propTypes = {
  value: prop.oneOfType([prop.object, prop.string]),
}
