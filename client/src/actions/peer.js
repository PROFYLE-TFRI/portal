/*
 * peer.js
 */


import * as requests from '../requests'
import { createFetchAction, createFetchConstants } from '../helpers/actions'

export const FIND_ALL = createFetchConstants('PEER.FIND_ALL')
export const CREATE   = createFetchConstants('PEER.CREATE')
export const UPDATE   = createFetchConstants('PEER.UPDATE')
export const REMOVE   = createFetchConstants('PEER.REMOVE')


export const findAll = createFetchAction(FIND_ALL, () => {
  return (dispatch, getState) => {
    const { auth } = getState()

    if (!auth.isLoggedIn || auth.isLoading)
      return

    dispatch(findAll.request())

    return requests.peer.findAll()
    .then(peers => dispatch(findAll.receive(peers)))
    .catch(err => dispatch(findAll.error(err)))
  }
})

export const create = createFetchAction(CREATE, (newUser) => {
  return (dispatch, getState) => {
    const { peers } = getState()

    if (peers.isLoading)
      return

    dispatch(create.request())

    return requests.peer.create(newUser)
    .then(newUser => dispatch(create.receive(newUser)))
    .catch(err => dispatch(create.error(err)))
  }
})

export const update = createFetchAction(UPDATE, (modifiedUser) => {
  return (dispatch, getState) => {
    const { peers } = getState()

    if (peers.isLoading)
      return

    dispatch(update.request())

    return requests.peer.update(modifiedUser)
    .then(modifiedUser => dispatch(update.receive(modifiedUser)))
    .catch(err => dispatch(update.error(err)))
  }
})

export const remove = createFetchAction(REMOVE, (id) => {
  return (dispatch, getState) => {
    const { peers } = getState()

    if (peers.isLoading)
      return

    dispatch(remove.request())

    return requests.peer.remove(id)
    .then(() => dispatch(remove.receive(undefined, { id })))
    .catch(err => dispatch(remove.error(err)))
  }
})
