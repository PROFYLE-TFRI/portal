/*
 * donor.js
 */


import * as requests from '../requests'
import { createFetchAction, createFetchConstants } from '../helpers/actions'
import * as Global from './global'

export const FIND_ALL = createFetchConstants('DONOR_FIND_ALL')


export const findAll = createFetchAction(FIND_ALL, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (!auth.isLoggedIn || auth.isLoading)
      return

    dispatch(findAll.request())

    return requests.donor.findAll()
    .catch(err => {
      if (err.warning) {
        dispatch(Global.createWarning(err.warnings))
        return Promise.resolve(err.data)
      }
      return Promise.reject(err)
    })
    .then(users => dispatch(findAll.receive(users)))
    .catch(err => dispatch(findAll.error(err)))
  }
})
