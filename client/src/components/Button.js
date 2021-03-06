/*
 * Button.js
 */


import React from 'react';
import { Button as ReactstrapButton } from 'reactstrap'

import Icon from './Icon'

export default function Button({ loading, children, icon, iconAfter, ...rest }) {
  return (
    <ReactstrapButton disabled={loading === true} { ...rest }>
      {
        icon &&
          <Icon name={icon} />
      } { children } { loading &&
        <Icon name='spinner' spin />
      } {
        iconAfter &&
          <Icon name={iconAfter} />
      }
    </ReactstrapButton>
  )
}
