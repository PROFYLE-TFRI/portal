/*
 * Icon.js
 */


import React from 'react';
import classname from 'classname';


export default function Icon({ name, spin, className }) {
  const iconClassName = classname(
    'Icon',
    'fa',
    `fa-${name}`,
    { 'fa-spin': spin },
    className
  )
  return (
    <i className={iconClassName} />
  )
}
