/*
 * SampleTable.js
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { BootstrapTable as Table } from 'react-bootstrap-table';

import { ENTITIES, SELECTION_COLOR, SAMPLE_COLUMNS } from '../constants';
import { renderColumn } from '../helpers/table';
import {
  select,
  selectAll,
  deselect,
  deselectAll,
} from '../actions'



const selectSample       = select.bind(null, ENTITIES.SAMPLES)
const selectAllSamples   = selectAll.bind(null, ENTITIES.SAMPLES)
const deselectSample     = deselect.bind(null, ENTITIES.SAMPLES)
const deselectAllSamples = deselectAll.bind(null, ENTITIES.SAMPLES)


const mapStateToProps = state => ({
  selected: [...state.ui.selection.samples],
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ selectSample, deselectSample, selectAllSamples, deselectAllSamples }, dispatch)

class SampleTable extends Component {

  render() {

    const {
      samples,
      selected,
      selectSample,
      deselectSample,
      selectAllSamples,
      deselectAllSamples,
    } = this.props

    const options = {
      sizePerPage: 15,
      hideSizePerPage: true
    }
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      bgColor: SELECTION_COLOR,
      onSelect: (sample, isSelected, e) => isSelected ? selectSample(sample.id) : deselectSample(sample.id),
      onSelectAll: (isSelected, rows) => isSelected ? selectAllSamples() : deselectAllSamples(),
      selected: selected
    }

    return (
      <div className='SampleTable table-sm'>
        <Table data={samples} version='4'
            selectRow={selectRowProp}
            options={options}
            pagination={true}
            hover={true}
            trClassName='clickable'
        >
          {
            SAMPLE_COLUMNS.map(renderColumn)
          }
        </Table>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SampleTable);
