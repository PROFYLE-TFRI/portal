/*
 * gene.js
 */


import * as requests from '../requests'
import { createFetchAction, createFetchConstants } from '../helpers/actions'

export const CLEAR = 'GENE.CLEAR'
export const SET_SEARCH = 'GENE.SET_SEARCH'
export const SEARCH_BY_NAME = createFetchConstants('GENE.SEARCH_BY_NAME')


export function setSearch(name) {
  return {
    type: SET_SEARCH,
    payload: name
  }
}

export function clear() {
  return {
    type: CLEAR
  }
}

export const searchByName = createFetchAction(SEARCH_BY_NAME, (name) => {
  return (dispatch, getState) => {

    dispatch(setSearch(name))

    if (name === '') {
      dispatch(clear())
      return
    }

    dispatch(searchByName.request())

    return requests.gene.searchByName(name)
    .then(users => dispatch(searchByName.receive(users)))
    .catch(err => dispatch(searchByName.error(err)))
  }
})
