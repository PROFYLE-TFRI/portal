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
  fn.error   = (error, meta = {}, isError = true) => ({
      type: ks.ERROR,
      error: isError,
      payload: asMessage(error),
      meta
    })

  return fn
}


function asMessage(error) {
  console.error(error)
  if (error.response)
    return error.response.data.message
  return error.message
}
