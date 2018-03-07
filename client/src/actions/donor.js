/*
 * donor.js
 */


import * as requests from '../requests'
import { createFetchAction, createFetchConstants } from '../helpers/actions'

export const FIND_ALL = createFetchConstants('DONOR_FIND_ALL')


export const findAll = createFetchAction(FIND_ALL, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (!auth.isLoggedIn || auth.isLoading)
      return

    dispatch(findAll.request())

    return requests.donor.findAll()
    .then(users => dispatch(findAll.receive(users)))
    .catch(err => dispatch(findAll.error(err)))
  }
})
