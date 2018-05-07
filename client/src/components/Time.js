/*
 * Time.jsx
 */

import React from 'react'
import prop from 'prop-types'
import { UncontrolledTooltip } from 'reactstrap'
import cuid from 'cuid'

import humanReadableTime from '../helpers/human-readable-time.js'


export default function Time({ value }) {
  const id = cuid()
  const date = new Date(value)
  return (
    <span>
      <abbr className='Time' id={id}>{ humanReadableTime(date) }</abbr>
      <UncontrolledTooltip placement="top" target={id}>
        { date.toString() }
      </UncontrolledTooltip>
    </span>
  )
}

Time.propTypes = {
  value: prop.oneOfType([prop.object, prop.string]).isRequired,
}
