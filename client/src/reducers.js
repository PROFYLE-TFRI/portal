import { combineReducers } from 'redux';

import {
    REQUEST_DONORS
  , RECEIVE_DONORS
  , SELECT_DONOR
  , DESELECT_DONOR
  , SELECT_ALL_DONORS
  , DESELECT_ALL_DONORS
} from './actions';
import {
    createDefaultUI
  , createDefaultData
} from './models';

const { keys } = Object

function uiReducer(state = createDefaultUI(), action, data) {
  switch (action.type) {
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
  const data = dataReducer(state.data, action)
  const ui = uiReducer(state.ui, action, data)
  return { ui, data }
}
