/*
 * SampleTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { compose } from 'ramda';

import { renderColumn } from '../helpers/table';
import { selectDonor, deselectDonor } from '../actions';
import { selectAllDonors, deselectAllDonors } from '../actions';
import { selectionColor, SAMPLE_COLUMNS } from '../constants';

const { values } = Object





const mapStateToProps = state => ({
    donors: values(state.data.donors)
  , selected: [...state.ui.selection.donors]
})
const mapDispatchToProps = dispatch => ({
    selectDonor:       compose(dispatch, selectDonor)
  , deselectDonor:     compose(dispatch, deselectDonor)
  , selectAllDonors:   compose(dispatch, selectAllDonors)
  , deselectAllDonors: compose(dispatch, deselectAllDonors)
})
class SampleTable extends Component {

  render() {

    const { samples } = this.props
    const { selectDonor, deselectDonor, selectAllDonors, deselectAllDonors } = this.props

    const options = {
      sizePerPage: 15,
      hideSizePerPage: true
    }
    const selectRowProp = {
      //mode: 'checkbox',
      //clickToSelect: true,
      //bgColor: selectionColor,
      //onSelect: (donor, isSelected, e) => isSelected ? selectDonor(donor.id) : deselectDonor(donor.id),
      //onSelectAll: (isSelected, rows) => isSelected ? selectAllDonors() : deselectAllDonors(),
      //selected: selected
            //selectRow={selectRowProp}
    }

    return (
      <div className='SampleTable table-sm'>
        <Table data={samples} version='4'
            options={options}
            pagination={true}
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
