/*
 * AutocompleteInput.js
 */

import React from 'react'
import propTypes from 'prop-types'
import { Input, } from 'reactstrap'

export default class AutocompleteInput extends React.Component {

  static propTypes = {
    value: propTypes.string.isRequired,
    items: propTypes.array.isRequired,
    onAccept: propTypes.func.isRequired,
    onChange: propTypes.func.isRequired,
    className: propTypes.string,
    renderItem: propTypes.func,
    renderText: propTypes.func,
  }

  static highlight = (item, prefix) => {
    if (!item.toLowerCase().startsWith(prefix.toLowerCase()))
      return <span>{ item }</span>

    const rest = item.slice(prefix.length)
    return (
      <span>
        <span className='highlight'>{ item.slice(0, prefix.length) }</span>
        { rest }
      </span>
    )
  }

  state = {
    index: 0,
    open: false,
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value)
      this.props.onChange(props.value)

    if (props.items !== this.props.items)
      this.setState({ index: 0 })
  }

  onFocus = () => {
    setTimeout(() => this.setState({ open: true }), 100)
  }

  onBlur = () => {
    setTimeout(() => this.setState({ open: false }), 200)
  }

  onKeyDown = ev => {
    if (ev.which === 13 /* Enter */) {
      if (this.props.items.length > 0)
        this.selectItem(this.state.index)

      if (document.activeElement.tagName === 'INPUT')
        document.activeElement.blur()
    }

    if (ev.which === 9 /* Tab */) {
      if (this.props.items.length > 1) {
        ev.preventDefault()
        if (ev.shiftKey)
          this.moveSelection(-1)
        else
          this.moveSelection(+1)
      }
    }
    if (ev.which === 38 /* ArrowUp */) {
      this.moveSelection(-1)
    }
    if (ev.which === 40 /* ArrowDown */) {
      this.moveSelection(+1)
    }
  }

  onChange = (ev) => {
    this.props.onChange(ev.target.value)
  }

  moveSelection = n => {
    const { length } = this.props.items
    let index = this.state.index + n

    if (index < 0)
      index = index + length
    else if (index > length - 1)
      index = index % length

    this.setState({ index })
  }

  selectItem = index => {
    const item = this.props.items[index]
    this.props.onAccept(item)
    this.setState({ open: false })
  }

  render() {
    const {
      value,
      items,
      renderText,
      renderItem,
      onAccept, // eslint-disable-line no-unused-vars
      onChange, // eslint-disable-line no-unused-vars
      className,
      ...rest
    } = this.props

    return (
      <div className='autocomplete'>
        <Input
          { ...rest }
          type='search'
          autoComplete='off'
          className={ ['autocomplete__input', className].join(' ') }
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          value={value}
        />
        {
          this.state.open &&
            <div className='autocomplete__dropdown-menu'>
              {
                items.length === 0 &&
                  <div className={ 'autocomplete__item autocomplete__item--empty' }>
                    <span>No results</span>
                  </div>
              }
              {
                items.map((item, i) =>
                  <div
                    key={i}
                    className={ 'autocomplete__item ' + (i === this.state.index ? 'autocomplete__item--selected' : '') }
                    onClick={() => this.selectItem(i)}
                  >
                    {
                      renderItem ? renderItem(item) :
                      renderText ? AutocompleteInput.highlight(renderText(item), value) :
                                   AutocompleteInput.highlight(item, value)
                    }
                  </div>
                )
              }
            </div>
        }
      </div>
    )
  }
}
