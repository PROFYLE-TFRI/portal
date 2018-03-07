import { compose, prop, flatten } from './helpers/rambda';
import indexBy from './helpers/index-by'
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
  , SELECT_EXPERIMENT
  , DESELECT_EXPERIMENT
  , SELECT
  , DESELECT
  , SELECT_ALL
  , DESELECT_ALL
  , SEARCH
  , SET_TAB
} from './actions';
import * as USER from './actions/user';
import { computeValues } from './models';
import { TABS } from './constants'

const { keys } = Object

function createDefaultUI() {
  return {
    tab: TABS.PORTAL,
    search: '',
    message: undefined,
    selection: {
      donors: new Set(),
      experiment: undefined,
    },
  }
}
function uiReducer(state = createDefaultUI(), action, data) {
  if (action.error)
    return { ...state, message: action.message }

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

    case SEARCH: {
      return { ...state, search: action.payload }
    }
    case SET_TAB: {
      return { ...state, tab: action.payload }
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

    case SELECT_EXPERIMENT: {
      return { ...state,
        selection: { ...state.selection,
          experiment: action.payload } }
    }
    case DESELECT_EXPERIMENT: {
      return { ...state,
        selection: { ...state.selection,
          experiment: undefined } }
    }

    default:
      return state;
  }
}

function createDefaultAuth() {
  return {
    initialCheck: false,
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
      return { ...createDefaultAuth(), initialCheck: true }
    }
    case LOG_OUT.ERROR: {
      return { ...state, isLoading: false  }
    }
    case IS_LOGGED_IN.REQUEST: {
      return { ...state, isLoading: true }
    }
    case IS_LOGGED_IN.RECEIVE: {
      const isLoggedIn = action.payload !== false
      return {
        ...state,
        initialCheck: true,
        isLoading: false,
        isLoggedIn: isLoggedIn,
        user: isLoggedIn ? action.payload : undefined
      }
    }
    case IS_LOGGED_IN.ERROR: {
      return { ...state, isLoading: false  }
    }

    case USER.UPDATE.RECEIVE: {
      if (action.payload.id === state.user.id)
        return { ...state, user: action.payload }
      return state
    }

    default:
      return state;
  }
}

function createDefaultData() {
  return {
      isLoading: false
    , donors: {}
    , samples: {}
    , experiments: {}
  }
}
function dataReducer(state = createDefaultData(), action, ui) {
  switch (action.type) {
    case REQUEST_DONORS: {
      return { ...state, isLoading: true }
    }
    case RECEIVE_DONORS: {
      const donors = action.donors
      const samples =
        indexBy(prop('id'),
          flatten(
            Object.values(action.donors)
              .map(compose(Object.values, prop('samples')))))
      const experiments =
        indexBy(prop('id'),
          flatten(
            Object.values(samples)
              .map(compose(Object.values, prop('experiments')))))
      return {
        ...state,
        isLoading: false,
        donors,
        samples,
        experiments,
      }
    }
    case RECEIVE_ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

function createDefaultUsers() {
  return {
    isLoading: false,
    data: [],
    message: undefined,
  }
}
function usersReducer(state = createDefaultUsers(), action) {
  switch (action.type) {
    case USER.FIND_ALL.REQUEST: {
      return { ...state, isLoading: true }
    }
    case USER.FIND_ALL.RECEIVE: {
      return { ...state, isLoading: false, data: action.payload }
    }
    case USER.FIND_ALL.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case USER.CREATE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case USER.CREATE.RECEIVE: {
      return { ...state, isLoading: false, data: [...state.data, action.payload] }
    }
    case USER.CREATE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case USER.UPDATE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case USER.UPDATE.RECEIVE: {
      return { ...state, isLoading: false, data: state.data.map(user => user.id === action.payload.id ? action.payload : user) }
    }
    case USER.UPDATE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case USER.REMOVE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case USER.REMOVE.RECEIVE: {
      return { ...state, isLoading: false, data: state.data.filter(user => user.id !== action.meta.id) }
    }
    case USER.REMOVE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case IS_LOGGED_IN.RECEIVE:
    case LOG_IN.RECEIVE: {
      return { ...state, isLoading: false, data: [action.payload] }
    }

    default:
      return state;
  }
}

export const rootReducer = (state = {}, action) => {
  const data = computeValues(dataReducer(state.data, action))
  const ui = uiReducer(state.ui, action, data)
  const auth = authReducer(state.auth, action)
  const users = usersReducer(state.users, action)

  // Initialize empty selections
  keys(data.values).forEach(which => {
    if (!ui.selection[which])
      ui.selection[which] = new Set()
  })

  return { ui, data, auth, users }
}
