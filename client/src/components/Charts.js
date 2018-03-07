/*
 * Charts.js
 */


import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Pie, PieChart, Cell, Sector } from 'recharts';
import Curve from 'recharts/es6/shape/Curve';
import { polarToCartesian } from 'recharts/es6/util/PolarUtils';
import { Row, Col, Button } from 'reactstrap';
import { compose } from 'ramda';

import { COLORS } from '../constants';
import { select, deselect, deselectAll } from '../actions';

const { values, entries } = Object


const RADIAN = Math.PI / 180;
const MIN_DIFF_ANGLE = 25


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
    ]

    return (
      <Row>

        {
          charts.map(({ title, which, field }, i) => {

            const data = generateChartData(donors, field, selection[which])

            return <Col key={i}>

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

              <CustomPieChart
                data={data}
                selection={selection[which]}
                onClick={this.handleClick.bind(this, which)}
              />

            </Col>
          })
        }

      </Row>
    )
  }
}

class CustomPieChart extends React.Component {
  state = {
    activeIndex: undefined
  }

  onEnter = (data, index) => {
    this.setState({ activeIndex: index })
  }

  onLeave = (data, index) => {
    this.setState({ activeIndex: undefined })
  }

  render() {
    const { data, onClick, selection } = this.props

    return (
      <PieChart width={540} height={300}>
        <Pie data={data}
          dataKey='value'
          cx='50%'
          cy='50%'
          innerRadius={40}
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
          onClick={onClick}
          onMouseEnter={this.onEnter}
          onMouseLeave={this.onLeave}
          activeIndex={this.state.activeIndex}
          activeShape={renderActiveShape}
        >
          {
            data.map((entry, index) =>
            <Cell key={index} fill={getColor(entry, index, selection)}/>)
          }
        </Pie>
      </PieChart>
    )
  }
}

let lastAngle = 0

function renderLabel(params) {
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
    // value
  } = params;

  const name = payload.name === 'null' ? '(Empty)' : payload.name

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const textStyle = {
    fontSize: '11px',
    fontWeight: payload.selected ? 'bold' : 'normal',
    fontStyle: payload.name === 'null' ? 'italic' : 'normal',
    fill: '#333',
  }
  const countTextStyle = {
    fontSize: '11px',
    fill: '#999',
  }

  const offsetRadius = 20
  const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle)
  const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle)
  const lineProps = {
    ...params,
    fill: 'none',
    stroke: fill,
    points: [startPoint, endPoint],
  }

  if (lastAngle > midAngle)
    lastAngle = 0

  const diffAngle = midAngle - lastAngle
  const displayLabel = payload.selected || diffAngle > MIN_DIFF_ANGLE

  if (!displayLabel) {
    return null
  }

  lastAngle = midAngle

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

      <Curve
        { ...lineProps }
        type='linear'
        className='recharts-pie-label-line'
      />

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey}
        textAnchor={textAnchor}
        style={textStyle}
      >
        { name }
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={14}
        textAnchor={textAnchor}
        style={countTextStyle}
      >
        {`(${ payload.value } donor${ payload.value > 1 ? 's' : '' })`}
      </text>

    </g>
  )
}

function renderActiveShape(params) {
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
    // value
  } = params;

  const name = payload.name === 'null' ? '(Empty)' : payload.name

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const textStyle = {
    fontSize: '11px',
    fontWeight: payload.selected ? 'bold' : 'normal',
    fontStyle: payload.name === 'null' ? 'italic' : 'normal',
    fill: '#333',
  }
  const countTextStyle = {
    fontSize: '11px',
    fill: '#999',
  }

  const offsetRadius = 20
  const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle)
  const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle)
  const lineProps = {
    ...params,
    fill: 'none',
    stroke: fill,
    points: [startPoint, endPoint],
  }

  return (
    <g>

      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill={fill}
      />

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

      <Curve
        { ...lineProps }
        type='linear'
        className='recharts-pie-label-line'
      />

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey}
        textAnchor={textAnchor}
        style={textStyle}
      >
        { name }
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={14}
        textAnchor={textAnchor}
        style={countTextStyle}
      >
        {`(${ payload.value } donor${ payload.value > 1 ? 's' : '' })`}
      </text>

    </g>
  )
}

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
