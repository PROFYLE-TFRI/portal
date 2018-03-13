/*
 * actions.js
 */

import k from './shared-constants'
import * as requests from './requests'
import { createFetchAction, createFetchConstants } from './helpers/actions'
import * as Donor from './actions/donor'
import * as Peer from './actions/peer'
import * as User from './actions/user'

export const LOG_IN       = createFetchConstants('LOG_IN')
export const LOG_OUT      = createFetchConstants('LOG_OUT')
export const IS_LOGGED_IN = createFetchConstants('IS_LOGGED_IN')
export const REQUIRES_2FA = 'REQUIRES_2FA'

export const SELECT_DONOR = 'SELECT_DONOR'
export const DESELECT_DONOR = 'DESELECT_DONOR'
export const SELECT_ALL_DONORS = 'SELECT_ALL_DONORS'
export const DESELECT_ALL_DONORS = 'DESELECT_ALL_DONORS'

export const SELECT_EXPERIMENT   = 'SELECT_EXPERIMENT'
export const DESELECT_EXPERIMENT = 'DESELECT_EXPERIMENT'

export const SELECT = 'SELECT'
export const DESELECT = 'DESELECT'
export const SELECT_ALL = 'SELECT_ALL'
export const DESELECT_ALL = 'DESELECT_ALL'

export const SEARCH = 'SEARCH'
export const SET_TAB = 'SET_TAB'

export const doInitialFetch = () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    dispatch(Donor.findAll())

    if (auth.user.isAdmin) {
      dispatch(Peer.findAll())
      dispatch(User.findAll())
    }
  }
}

export const logIn = createFetchAction(LOG_IN, (email, password, code) => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (auth.isLoggedIn || auth.isLoading)
      return

    dispatch(logIn.request())

    return requests.auth.logIn(email, password, code)
    .then(user => {
      dispatch(logIn.receive(user))
      dispatch(doInitialFetch())
      return true
    })
    .catch(err => {
      if (err.message === k.AUTH.REQUIRES_2FA)
        return dispatch(requires2fa())
      if (err.message === k.AUTH.INVALID_2FA)
        return dispatch(logIn.error('Invalid code', undefined, false))
      if (err.message === k.AUTH.WRONG_USER_OR_PASSWORD)
        return dispatch(logIn.error('Wrong user/password combination', undefined, false))
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


export function selectDonor(id) {
  return {
    type: SELECT_DONOR,
    payload: id
  }
}

export function deselectDonor(id) {
  return {
    type: DESELECT_DONOR,
    payload: id
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

export function selectExperiment(id) {
  return {
    type: SELECT_EXPERIMENT,
    payload: id
  }
}

export function deselectExperiment() {
  return {
    type: DESELECT_EXPERIMENT
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
    payload: value
  }
}

export function setTab(tab) {
  return {
    type: SET_TAB,
    payload: tab
  }
}
