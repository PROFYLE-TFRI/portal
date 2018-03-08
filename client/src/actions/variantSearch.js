/*
 * variantSearch.js
 */

import * as requests from '../requests'
import { createFetchAction, createFetchConstants, createAction } from '../helpers/actions'

export const SEARCH = createFetchConstants('VARIANT_SEARCH.SEARCH')
export const CLEAR = 'CLEAR'
export const OPEN = 'OPEN'
export const CLOSE = 'CLOSE'
export const TOGGLE = 'TOGGLE'
export const SET_CHROM = 'SET_CHROM'
export const SET_START = 'SET_START'
export const SET_END = 'SET_END'

export const clear = createAction(CLEAR)
export const toggle = createAction(TOGGLE)
export const open = createAction(OPEN)
export const close = createAction(CLOSE)
export const setChrom = createAction(SET_CHROM)
export const setStart = createAction(SET_START)
export const setEnd = createAction(SET_END)

export const search = createFetchAction(SEARCH, () => {
  return (dispatch, getState) => {
    const { variantSearch } = getState()
    const { params } = variantSearch

    if (variantSearch.isLoading)
      return;

    if (!params.chrom || !params.start || !params.end)
      return;

    dispatch(search.request())

    return requests.variant.search(params)
    .then(results => dispatch(search.receive(results)))
    .catch(err => dispatch(search.error(err)))
  }
})
