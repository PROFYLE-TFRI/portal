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
    console.error('API: ' + error.response.data.message + '\n' + error.response.data.stack.join('\n'))
    return error.response.data.message
  }
  if (error.fromAPI) {
    console.error('API: ' + error.message + '\n' + error.stack.join('\n'))
  }
  return error.message
}
