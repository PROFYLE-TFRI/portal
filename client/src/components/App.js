import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardImg, CardText, CardBlock, CardLink, CardTitle, CardSubtitle } from 'reactstrap';

import './App.css';
import DonorTable from './DonorTable';

const { values } = Object

const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
})

class App extends Component {

  render() {

    const { donors } = this.props

    return (
      <div className="App">
        <div className='panel'>
          <div className='panel__caption'>Donors</div>
          <DonorTable />
        </div>

        {
          donors.map(donor =>
            <div key={donor.id} className='panel'>
              <h3>{donor.id}</h3>

              <pre>{ JSON.stringify(donor, null, 2) }</pre>

              {
                Object.keys(donor.samples).join(', ')
              }
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
