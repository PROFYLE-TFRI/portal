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
