import { combineReducers } from 'redux';

import {
    REQUEST_DONORS
  , RECEIVE_DONORS
  , SELECT_DONOR
  , DESELECT_DONOR
} from './actions';
import {
    createDefaultUI
  , createDefaultData
} from './models';


function uiReducer(state = createDefaultUI(), action) {
  switch (action.type) {
    case SELECT_DONOR: {
      return { ...state,
        selection: { ...state.selection,
          donors: new Set(state.selection.donors).add(action.id) } }
    }
    case DESELECT_DONOR: {
      return { ...state,
        selection: { ...state.selection,
          donors: new Set(state.selection.donors).delete(action.id) } }
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

export const rootReducer = combineReducers({
    ui: uiReducer
  , data: dataReducer
})
