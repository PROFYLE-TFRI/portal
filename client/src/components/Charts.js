/*
 * Charts.js
 */


import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell, Sector } from 'recharts';
import { Container, Row, Col, Button } from 'reactstrap';
import { compose } from 'ramda';

import { COLORS } from '../constants';
import { select, deselect, deselectAll } from '../actions';

const { keys, values, entries } = Object




const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , donors: values(state.data.donors)
})
const mapDispatchToProps = dispatch => ({
    select:   compose(dispatch, select)
  , deselect: compose(dispatch, deselect)
  , deselectAll: compose(dispatch, deselectAll)
})

class Charts extends Component {

  handleClick(which, ev) {
    const value = ev.payload.name === 'null' ? null : ev.payload.name

    if (this.props.selection[which].has(value))
      this.props.deselect(which, value)
    else
      this.props.select(which, value)
  }

  clearAll(which) {
    this.props.deselectAll(which)
  }

  render() {

    const { donors, selection } = this.props

    const charts = [
        { title: 'Diseases',  which: 'diseases',  field: 'disease' }
      , { title: 'Provinces', which: 'provinces', field: 'recruitement_team.province' }
    //, { title: 'Hospitals', which: 'hospitals', field: 'recruitement_team.hospital' }
    ]

    return (
      <Row>

        {
          charts.map(({ title, which, field }) => {

            const data = generateChartData(donors, field, selection[which])

            return <Col>

              <h4 className='text-center'>
                <span className='Charts__title'>
                  <span className='text-bold'>
                  { title }
                  </span>
                  <span className='Charts__clear'>
                    <Button size='sm'
                      disabled={selection[which].size === 0}
                      onClick={this.clearAll.bind(this, which)}>
                      Clear selection
                    </Button>
                  </span>
                </span>
              </h4>

              <PieChart width={540} height={300}>
                <Pie data={data}
                  onClick={this.handleClick.bind(this, which)}
                  cx='50%'
                  cy='50%'
                  innerRadius={40}
                  outerRadius={80}
                  label={renderLabel}
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

function renderLabel(props) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>

      { payload.selected &&
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      }

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey}
        textAnchor={textAnchor}
        fill='#333'
        style={{ fontWeight: payload.selected ? 'bold' : 'normal' }}
      >
        { payload.name }
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={14} textAnchor={textAnchor} fill='#999'>
        {`(${ payload.value } donor${ payload.value > 1 ? 's' : '' })`}
      </text>
    </g>
  );
};

function generateChartData(records, property, selection) {
  const map = {}
  records.forEach(r => {
    const value = r[property]
    map[value] = map[value] !== undefined ? map[value] + 1 : 1
  })

  const data = entries(map)
    .reduce((acc, [name, value]) => acc.concat({ name, value }), [])
    .map((entry, index) => {
      const name = entry.name === 'null' ? null : entry.name
      entry.selected = selection.has(name)
      entry.fill = getColor(entry, index, selection)
      return entry
    })

  return data
}

function getColor(entry, index, selection = new Set([])) {
  return COLORS[index % COLORS.length]
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
