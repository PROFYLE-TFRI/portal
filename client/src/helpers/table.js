/*
 * table.js
 */

import React, { Component } from 'react';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';



export function renderColumn({ field, title, type }, i) {
  return <Header
    isKey={i === 0}
    dataSort={true}
    dataField={field}
    dataFormat={type === 'link' ? formatLink : undefined}
    >{title}</Header>
}

export function formatLink(link, row) {
  return <a href={link}>{ link }</a>
}
