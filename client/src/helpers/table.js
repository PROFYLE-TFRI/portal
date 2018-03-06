/*
 * table.js
 */

import React from 'react';
import { TableHeaderColumn as Header } from 'react-bootstrap-table';



export function renderColumn({ field, title, type, uri, format, isKey }, i) {
  return (
    <Header
      key={field}
      isKey={isKey}
      columnTitle={true}
      dataSort={true}
      dataField={field}
      dataFormat={
        format !== undefined ? format :
        type === 'link' ? formatLink :
        uri !== undefined ? (_, data, ...args) => formatLink(data[uri], data[field]) :
        /* otherwise */ undefined}
    >
      {title}
    </Header>
  )
}

export function formatLink(link, text = link) {
  return <a href={link}>{text}</a>
}
