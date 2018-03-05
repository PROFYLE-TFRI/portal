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


export function asMessage(error) {
  console.error(error)
  if (typeof error === 'string')
    return error
  if (error.response) {
    console.error('API error:')
    console.error(error.response.data.message)
    console.error(error.response.data.stack)
    return error.response.data.message
  }
  return error.message
}
