/*
 * actions.js
 */

import identity from 'lodash/identity';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';



export function createFetchConstants(name) {
  return {
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`,
  }
}

export function createFetchAction(ks, fn) {
  fn.request = (meta = {}) => ({ type: ks.REQUEST, meta })
  fn.receive = (payload, meta = {}) => ({ type: ks.RECEIVE, payload, meta })
  fn.error   = (error, meta = {}, isError = true) => ({
      type: ks.ERROR,
      error: isError,
      payload: asMessage(error),
      meta
    })

  return fn
}

/* taken from redux-actions */
export function createAction(type, payloadCreator = identity, metaCreator) {
  console.assert(
    isFunction(payloadCreator) || isNull(payloadCreator),
    'Expected payloadCreator to be a function, undefined or null'
  )

  const finalPayloadCreator = isNull(payloadCreator) || payloadCreator === identity
    ? identity
    : (head, ...args) => (head instanceof Error
      ? head : payloadCreator(head, ...args));

  const hasMeta = isFunction(metaCreator);
  const typeString = type.toString();

  const actionCreator = (...args) => {
    const payload = finalPayloadCreator(...args);
    const action = { type };

    if (payload instanceof Error)
      action.error = true;

    if (payload !== undefined)
      action.payload = payload;

    if (hasMeta)
      action.meta = metaCreator(...args);

    return action;
  };

  actionCreator.toString = () => typeString;

  return actionCreator;
}


export function asMessage(error) {
  console.error(error)
  if (typeof error === 'string')
    return error
  if (error.response) {
    console.error('API: ' + error.response.data.message + '\n' + error.response.data.stack)
    return error.response.data.message
  }
  if (error.fromAPI) {
    console.error('API: ' + error.message + '\n' + error.stack)
  }
  return error.message
}

