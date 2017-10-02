/*
 * table.js
 */

import React, { Component } from 'react';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';



export function renderColumn({ field, title, type, uri }, i) {
  return <Header
    key={field}
    isKey={i === 0}
    dataSort={true}
    dataField={field}
    dataFormat={
      type === 'link' ? formatLink :
      uri !== undefined ? (_, data) => formatLink(data[uri]) :
      /* otherwise */ undefined}
    >{title}</Header>
}

export function formatLink(link, data) {
  return <a href={link}>{ link }</a>
}
