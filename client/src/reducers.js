import { combineReducers } from 'redux';

import {
    REQUEST_DONORS
  , RECEIVE_DONORS
} from './actions';
import {
    createDefaultUI
  , createDefaultData
} from './models';

function uiReducer(state = createDefaultUI(), action) {
  switch (action.type) {
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
