/*
 * DonorTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  BootstrapTable as Table,
  TableHeaderColumn as Header
} from 'react-bootstrap-table';


const { values } = Object

const mapStateToProps = state => ({
  donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
})

class DonorTable extends Component {

  render() {

    const { donors } = this.props

    return (
      <div className='DonorTable'>
        <Table data={donors} version='4'>
          <Header isKey dataField='id'>ID</Header>
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
