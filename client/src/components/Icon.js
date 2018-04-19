/*
 * Icon.js
 */


import React from 'react';
import classname from 'classname';


export default function Icon({ name, color, spin, className }) {
  const iconClassName = classname(
    'Icon',
    'fa',
    `fa-${name}`,
    color ? `text-${color}` : '',
    { 'fa-spin': spin },
    className
  )
  return (
    <i className={iconClassName} />
  )
}
