import {
    LOG_IN
  , LOG_OUT
  , IS_LOGGED_IN
  , REQUIRES_2FA
  , REQUEST_DONORS
  , RECEIVE_DONORS
  , RECEIVE_ERROR
  , SELECT_DONOR
  , DESELECT_DONOR
  , SELECT_ALL_DONORS
  , DESELECT_ALL_DONORS
  , SELECT
  , DESELECT
  , SELECT_ALL
  , DESELECT_ALL
  , SEARCH
} from './actions';
import { computeValues } from './models';

const { keys } = Object

function createDefaultUI() {
  return {
    search: '',
    message: undefined,
    selection: {
      donors: new Set()
    },
  }
}
function uiReducer(state = createDefaultUI(), action, data) {
  switch (action.type) {
    case RECEIVE_ERROR: {
      return { ...state, message: action.message }
    }
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

    case SEARCH: {
      return { ...state, search: action.value }
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

function createDefaultAuth() {
  return {
    isLoading: false,
    isLoggedIn: false,
    requires2fa: false,
    user: undefined,
    message: undefined,
  }
}
function authReducer(state = createDefaultAuth(), action) {
  switch (action.type) {
    case LOG_IN.REQUEST: {
      return { ...state, isLoading: true }
    }
    case LOG_IN.RECEIVE: {
      return { ...state, isLoading: false, isLoggedIn: true, user: action.payload, message: undefined }
    }
    case LOG_IN.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }
    case REQUIRES_2FA: {
      return { ...state, isLoading: false, requires2fa: action.payload, message: undefined }
    }
    case LOG_OUT.REQUEST: {
      return { ...state, isLoading: true }
    }
    case LOG_OUT.RECEIVE: {
      return createDefaultAuth()
    }
    case LOG_OUT.ERROR: {
      return { ...state, isLoading: false  }
    }
    case IS_LOGGED_IN.REQUEST: {
      return { ...state, isLoading: true }
    }
    case IS_LOGGED_IN.RECEIVE: {
      const isLoggedIn = action.payload !== false
      return { ...state, isLoading: false, isLoggedIn: isLoggedIn, user: isLoggedIn ? action.payload : undefined  }
    }
    case IS_LOGGED_IN.ERROR: {
      return { ...state, isLoading: false  }
    }
    default:
      return state;
  }
}

function createDefaultData() {
  return {
      isLoading: false
    , donors: {}
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
    case RECEIVE_ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

export const rootReducer = (state = {}, action) => {
  const data = computeValues(dataReducer(state.data, action))
  const ui = uiReducer(state.ui, action, data)
  const auth = authReducer(state.auth, action)

  // Initialize empty selections
  keys(data.values).forEach(which => {
    if (!ui.selection[which])
      ui.selection[which] = new Set()
  })

  return { ui, data, auth }
}
