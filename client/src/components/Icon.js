/*
 * Icon.js
 */


import React from 'react';


export default function Icon({ name, spin }) {
  const className = `Icon fa fa-${name} ${spin ? 'fa-spin' : ''}`
  return (
    <i className={className} />
  )
}
