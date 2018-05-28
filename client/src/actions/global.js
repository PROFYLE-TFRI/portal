/*
 * global.js
 */


import { createAction } from '../helpers/actions'

export const CREATE_ERROR   = 'CREATE_ERROR'
export const CREATE_WARNING = 'CREATE_WARNING'
export const CLEAR_ERROR_MESSAGE = 'CLEAR_ERROR_MESSAGE'
export const CLEAR_WARNING_MESSAGE = 'CLEAR_WARNING_MESSAGE'

export function createError(error) {
  return {
    type: CREATE_ERROR,
    error: true,
    payload: error
  }
}

export function createWarning(warnings) {
  return {
    type: CREATE_WARNING,
    warning: true,
    payload: warnings
  }
}

export const clearErrorMessage   = createAction(CLEAR_ERROR_MESSAGE)
export const clearWarningMessage = createAction(CLEAR_WARNING_MESSAGE)
