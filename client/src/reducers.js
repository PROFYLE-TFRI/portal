import { prop } from 'ramda';

import {
    REQUEST_DONORS
  , RECEIVE_DONORS
  , SELECT_DONOR
  , DESELECT_DONOR
  , SELECT_ALL_DONORS
  , DESELECT_ALL_DONORS
  , SELECT
  , DESELECT
  , SELECT_ALL
  , DESELECT_ALL
} from './actions';
import {
    createDefaultUI
  , createDefaultData
  , computeValues
} from './models';

const { keys } = Object

function uiReducer(state = createDefaultUI(), action, data) {
  switch (action.type) {
    case SELECT: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: new Set(state.selection[action.which]).add(action.value) } }
    }
    case DESELECT: {
      const items = new Set(state.selection[action.which])
      items.delete(action.value)
      return { ...state,
        selection: { ...state.selection,
          [action.which]: items } }
    }
    case SELECT_ALL: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: new Set(data.values[action.which]) } }
    }
    case DESELECT_ALL: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: new Set() } }
    }


    case SELECT_DONOR: {
      return { ...state,
        selection: { ...state.selection,
          donors: new Set(state.selection.donors).add(action.id) } }
    }
    case DESELECT_DONOR: {
      const donors = new Set(state.selection.donors)
      donors.delete(action.id)
      return { ...state,
        selection: { ...state.selection,
          donors: donors } }
    }
    case SELECT_ALL_DONORS: {
      return { ...state,
        selection: { ...state.selection,
          donors: new Set(keys(data.donors)) } }
    }
    case DESELECT_ALL_DONORS: {
      return { ...state,
        selection: { ...state.selection,
          donors: new Set() } }
    }
    default:
      return state;
  }
}

function dataReducer(state = createDefaultData(), action, ui) {
  switch (action.type) {
    case REQUEST_DONORS: {
      return { ...state, isLoading: true }
    }
    case RECEIVE_DONORS: {
      return { ...state, isLoading: false, donors: action.donors }
    }
    default:
      return state;
  }
}

export const rootReducer = (state = {}, action) => {
  const data = computeValues(dataReducer(state.data, action))
  const ui = uiReducer(state.ui, action, data)

  // Initialize empty selections
  keys(data.values).forEach(which => {
    if (!ui.selection[which])
      ui.selection[which] = new Set()
  })

  return { ui, data }
}
