/*
 * actions.js
 */

import k from './shared-constants'
import * as requests from './requests'

export const LOG_IN       = createFetchConstants('LOG_IN')
export const LOG_OUT      = createFetchConstants('LOG_OUT')
export const IS_LOGGED_IN = createFetchConstants('IS_LOGGED_IN')
export const REQUIRES_2FA = 'REQUIRES_2FA'

export const REQUEST_DONORS = 'REQUEST_DONORS'
export const RECEIVE_DONORS = 'RECEIVE_DONORS'
export const RECEIVE_ERROR  = 'RECEIVE_ERROR'

export const SELECT_DONOR = 'SELECT_DONOR'
export const DESELECT_DONOR = 'DESELECT_DONOR'
export const SELECT_ALL_DONORS = 'SELECT_ALL_DONORS'
export const DESELECT_ALL_DONORS = 'DESELECT_ALL_DONORS'

export const SELECT = 'SELECT'
export const DESELECT = 'DESELECT'
export const SELECT_ALL = 'SELECT_ALL'
export const DESELECT_ALL = 'DESELECT_ALL'

export const SEARCH = 'SEARCH'

export const logIn = createFetchAction(LOG_IN, (email, password, code) => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (auth.isLoggedIn || auth.isLoading)
      return

    dispatch(logIn.request())

    return requests.auth.logIn(email, password, code)
    .then(user => dispatch(logIn.receive(user)))
    .then(() => dispatch(fetchDonors()))
    .then(() => true)
    .catch(err => {
      if (err.message === k.AUTH.REQUIRES_2FA)
        return dispatch(requires2fa())
      if (err.message === k.AUTH.INVALID_2FA)
        return dispatch(logIn.error('Invalid code', false))
      if (err.message === k.AUTH.WRONG_USER_OR_PASSWORD)
        return dispatch(logIn.error('Wrong user/password combination', false))
      return dispatch(logIn.error(err))
    })
  }
})

export const logOut = createFetchAction(LOG_OUT, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (!auth.isLoggedIn || auth.isLoading)
      return

    dispatch(logOut.request())

    return requests.auth.logOut()
    .then(() => dispatch(logOut.receive()))
    .then(() => true)
    .catch(err => dispatch(logOut.error(err)))
  }
})

export const isLoggedIn = createFetchAction(IS_LOGGED_IN, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (auth.isLoading)
      return

    dispatch(isLoggedIn.request())

    return requests.auth.isLoggedIn()
    .then(user => {
      dispatch(isLoggedIn.receive(user))
      return Boolean(user)
    })
    .catch(err => dispatch(isLoggedIn.error(err)))
  }
})

export function requires2fa(value = true) {
  return {
    type: REQUIRES_2FA,
    payload: value
  }
}

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

export function receiveError(message) {
  return {
    type: RECEIVE_ERROR,
    message
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

export function search(value) {
  return {
    type: SEARCH,
    value
  }
}

export function fetchDonors() {
  return (dispatch, getState) => {
    const { data } = getState()

    if (data.isLoading)
      return

    dispatch(requestDonors())

    requests.donor.findAll()
    .then(donors => dispatch(receiveDonors(donors)))
    .catch(err => dispatch(receiveError(err)))
  }
}

// Helpers

function createFetchConstants(name) {
  return {
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
  }
}

function createFetchAction(ks, fn) {
  fn.request = () => ({ type: ks.REQUEST })
  fn.receive = (payload) => ({ type: ks.RECEIVE, payload })
  fn.error   = (message, error = true) => ({ type: ks.ERROR, error, payload: message })
  return fn
}
