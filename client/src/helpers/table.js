/*
 * table.js
 */

import React from 'react';
import Header from 'react-bootstrap-table/lib/TableHeaderColumn';



export function renderColumn({
  field,
  title,
  type,
  uri,
  format,
  isKey,
  showTitle = true,
}, i) {

  return (
    <Header
      key={field}
      isKey={isKey}
      columnTitle={showTitle}
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
  return (
    <a href={link} title={text}>
      {text}
    </a>
  )
}
