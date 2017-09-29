/*
 * DonorTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { compose } from 'ramda';

import { selectDonor, deselectDonor } from '../actions';
import { selectionColor } from '../constants';

const { values } = Object





const mapStateToProps = state => ({
    donors: values(state.data.donors)
  , selected: [...state.ui.selection.donors]
})
const mapDispatchToProps = dispatch => ({
    selectDonor:   compose(dispatch, selectDonor)
  , deselectDonor: compose(dispatch, deselectDonor)
})
class DonorTable extends Component {

  render() {

    const { donors, selected } = this.props

    const options = {
      sizePerPage: 15,
      hideSizePerPage: true
    }
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      bgColor: selectionColor,
      onSelect: (row, isSelected, e) => {},
      onSelectAll: (isSelected, rows) => {},
      selected: selected
    }

    return (
      <div className='DonorTable table-sm'>
        <Table data={donors} version='4'
            selectRow={selectRowProp}
            options={options}
            pagination={true}
            search>
          <Header isKey dataField='id'>Donor</Header>
          <Header dataField='age'>Age</Header>
          <Header dataField='sex'>Sex</Header>
          <Header dataFormat={(cell, donor, row) => donor.recruitement_team.hospital}>Hospital</Header>
          <Header dataFormat={(cell, donor, row) => donor.recruitement_team.province}>Province</Header>
        </Table>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonorTable);
