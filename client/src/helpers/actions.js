/*
 * actions.js
 */



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
  fn.error   = (message, meta = {}, error = true) => ({ type: ks.ERROR, error, payload: message, meta })
  return fn
}
