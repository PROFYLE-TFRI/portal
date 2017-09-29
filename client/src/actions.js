/*
 * actions.js
 */

import {
  fetchJSON
} from './requests'

export const REQUEST_DONORS = 'REQUEST_DONORS'
export const RECEIVE_DONORS = 'RECEIVE_DONORS'

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
