/*
 * actions.js
 */

import {
  fetchJSON
} from './requests'

export const REQUEST_DONORS = 'REQUEST_DONORS'
export const RECEIVE_DONORS = 'RECEIVE_DONORS'

export const SELECT_DONOR = 'SELECT_DONOR'
export const DESELECT_DONOR = 'DESELECT_DONOR'
export const SELECT_ALL_DONORS = 'SELECT_ALL_DONORS'
export const DESELECT_ALL_DONORS = 'DESELECT_ALL_DONORS'

export const SELECT = 'SELECT'
export const DESELECT = 'DESELECT'
export const SELECT_ALL = 'SELECT_ALL'
export const DESELECT_ALL = 'DESELECT_ALL'

export function requestDonors() {
  return {
    type: REQUEST_DONORS
  }
}

export function receiveDonors(donors) {
  return {
    type: RECEIVE_DONORS,
    donors
  }
}

export function selectDonor(id) {
  return {
    type: SELECT_DONOR,
    id
  }
}

export function deselectDonor(id) {
  return {
    type: DESELECT_DONOR,
    id
  }
}

export function selectAllDonors() {
  return {
    type: SELECT_ALL_DONORS
  }
}

export function deselectAllDonors() {
  return {
    type: DESELECT_ALL_DONORS
  }
}

export function select(which, value) {
  return {
    type: SELECT,
    which,
    value
  }
}

export function deselect(which, value) {
  return {
    type: DESELECT,
    which,
    value
  }
}

export function selectAll(which) {
  return {
    type: SELECT_ALL,
    which
  }
}

export function deselectAll(which) {
  return {
    type: DESELECT_ALL,
    which
  }
}

export function fetchDonors() {
  return (dispatch, getState) => {
    const { data } = getState()

    if (data.isLoading)
      return

    dispatch(requestDonors())

    fetchJSON('/donor/list')
    .then(donors => dispatch(receiveDonors(donors)))
    .catch(err => {
      dispatch(receiveDonors({}))
      console.error(err)
      // TODO handle failure
    })
  }
}
