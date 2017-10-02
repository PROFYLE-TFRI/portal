/*
 * Charts.js
 */


import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
import { compose } from 'ramda';

import { OPAQUE_SELECTION_COLOR, COLORS } from '../constants';
import { select, deselect } from '../actions';

const { keys, values, entries } = Object




const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
    select:   compose(dispatch, select)
  , deselect: compose(dispatch, deselect)
})

class Charts extends Component {

  handleClick(which, ev) {
    const value = ev.payload.name === 'null' ? null : ev.payload.name

    if (this.props.selection[which].has(value))
      this.props.deselect(which, value)
    else
      this.props.select(which, value)
  }

  render() {

    const { donors, selection } = this.props

    const charts = [
        { which: 'diseases',  field: 'disease' }
      , { which: 'provinces', field: 'recruitement_team.province' }
    //, { which: 'hospitals', field: 'recruitement_team.hospital' }
    ]

    return (
      <Row>

        {
          charts.map(({ which, field }) => {

            const data = generateChartData(donors, field)
            return <Col>
              <PieChart width={500} height={250}>
                <Pie data={data}
                  onClick={this.handleClick.bind(this, which)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={renderNameLabel}
                >
                  {
                    data.map((entry, index) =>
                      <Cell fill={getColor(entry, index, selection[which])}/>)
                  }
                </Pie>
              </PieChart>
            </Col>
          })
        }

      </Row>
    )
  }
}

function getColor(entry, index, selection = new Set([])) {
  const name = entry.name === 'null' ? null : entry.name
  if (selection.has(name))
    return OPAQUE_SELECTION_COLOR
  return COLORS[index % COLORS.length]
}

function renderNameLabel(props) {
  const RADIAN = Math.PI / 180

  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload } = props
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill={payload.fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      { payload.name }
    </text>
  )
}

function generateChartData(records, property) {
  const map = {}
  records.forEach(r => {
    const value = r[property]
    map[value] = map[value] !== undefined ? map[value] + 1 : 1
  })
  const data = entries(map).reduce((acc, [name, value]) => acc.concat({ name, value }), [])
  return data
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
