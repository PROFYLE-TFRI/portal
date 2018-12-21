/*
 * user.js
 */

import * as requests from '../requests'
import { createAction, createFetchAction, createFetchConstants } from '../helpers/actions'

export const SET_MESSAGE   = 'USER.SET_MESSAGE'
export const CLEAR_MESSAGE = 'USER.CLEAR_MESSAGE'

export const FIND_ALL = createFetchConstants('USER_FIND_ALL')
export const CREATE   = createFetchConstants('USER_CREATE')
export const UPDATE   = createFetchConstants('USER_UPDATE')
export const REMOVE   = createFetchConstants('USER_REMOVE')


export const setMessage   = createAction(SET_MESSAGE)
export const clearMessage = createAction(CLEAR_MESSAGE)

export const findAll = createFetchAction(FIND_ALL, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (!auth.isLoggedIn || auth.isLoading)
      return

    dispatch(findAll.request())

    return requests.user.findAll()
    .then(users => dispatch(findAll.receive(users)))
    .catch(err => dispatch(findAll.error(err)))
  }
})

export const create = createFetchAction(CREATE, (newUser) => {
  return (dispatch, getState) => {
    const { users } = getState()

    if (users.isLoading)
      return

    dispatch(create.request())

    return requests.user.create(newUser)
    .then(newUser => dispatch(create.receive(newUser)))
    .catch(err => dispatch(create.error(err)))
  }
})

export const update = createFetchAction(UPDATE, (modifiedUser) => {
  return (dispatch, getState) => {
    const { users } = getState()

    if (users.isLoading)
      return

    dispatch(update.request())

    return requests.user.update(modifiedUser)
    .then(modifiedUser => dispatch(update.receive(modifiedUser)))
    .catch(err => dispatch(update.error(err)))
  }
})

export const remove = createFetchAction(REMOVE, (id) => {
  return (dispatch, getState) => {
    const { users } = getState()

    if (users.isLoading)
      return

    dispatch(remove.request())

    return requests.user.remove(id)
    .then(() => dispatch(remove.receive(undefined, { id })))
    .catch(err => dispatch(remove.error(err)))
  }
})
