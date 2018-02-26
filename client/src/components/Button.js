/*
 * Button.js
 */


import React from 'react';
import { Button as ReactstrapButton } from 'reactstrap'

import Icon from './Icon'

export default function Button({ loading, children, ...rest }) {
  return (
    <ReactstrapButton disabled={loading === true} { ...rest }>
      { children } { loading &&
        <Icon name='spinner' spin />
      }
    </ReactstrapButton>
  )
}
