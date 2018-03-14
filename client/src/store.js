/*
 * store.js
 */


import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { rootReducer } from './reducers';
import { logIn } from './actions'
import * as Donor from './actions/donor'
import * as Peer from './actions/peer'
import * as User from './actions/user'


const IS_SERVER  = typeof global !== 'undefined'
const IS_BROWSER = typeof window !== 'undefined'

export default function configureStore(...args) {
  if (IS_BROWSER)
    return configureBrowserStore(...args)

  if (IS_SERVER)
    return configureServerStore(...args)
}

function configureBrowserStore() {
  const initialState = window.__PRELOADED_STATE__ || {}
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store =
    (process.env.NODE_ENV === 'production')
    ? createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware))
    : createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunkMiddleware, createLogger())))

  return store
}

function configureServerStore(user, donors, users, peers) {
  const initialState = {}
  const store = createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware))

  if (user)
    store.dispatch(logIn.receive(user))
  if (donors)
    store.dispatch(Donor.findAll.receive(donors))
  if (users)
    store.dispatch(User.findAll.receive(users))
  if (peers)
    store.dispatch(Peer.findAll.receive(peers))

  return store
}
