import { compose, prop, flatten } from './helpers/rambda';
import indexBy from './helpers/index-by'
import {
    LOG_IN
  , LOG_OUT
  , IS_LOGGED_IN
  , REQUIRES_2FA
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
import * as DONOR from './actions/donor';
import * as GENE from './actions/gene';
import * as GLOBAL from './actions/global';
import * as PEER from './actions/peer';
import * as USER from './actions/user';
import * as VARIANT_SEARCH from './actions/variantSearch';
import { computeValues } from './models';
import { TABS } from './constants'


function createDefaultUI() {
  return {
    tab: TABS.PORTAL,
    search: '',
    errorMessage: undefined,
    warningMessage: undefined,
    selection: {
      donors: [],
      samples: [],
      experiment: undefined,
    },
  }
}
function uiReducer(state = createDefaultUI(), action, data) {
  if (action.error)
    return { ...state, errorMessage: action.message || action.payload }

  if (action.warning)
    return { ...state, warningMessage: action.message || action.payload }

  switch (action.type) {
    case GLOBAL.CLEAR_ERROR_MESSAGE: {
      return { ...state, errorMessage: undefined }
    }
    case GLOBAL.CLEAR_WARNING_MESSAGE: {
      return { ...state, warningMessage: undefined }
    }

    case SELECT: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: state.selection[action.which].concat(action.value) } }
    }
    case DESELECT: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: state.selection[action.which].filter(x => x !== action.value) } }
    }
    case SELECT_ALL: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: data.values[action.which] } }
    }
    case DESELECT_ALL: {
      return { ...state,
        selection: { ...state.selection,
          [action.which]: [] } }
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
          donors: state.selection.donors.concat(action.payload) } }
    }
    case DESELECT_DONOR: {
      return { ...state,
        selection: { ...state.selection,
          donors: state.selection.donors.filter(x => x !== action.payload) } }
    }
    case SELECT_ALL_DONORS: {
      return { ...state,
        selection: { ...state.selection,
          donors: Object.keys(data.donors) } }
    }
    case DESELECT_ALL_DONORS: {
      return { ...state,
        selection: { ...state.selection,
          donors: [] } }
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

function createDefaultVariantSearch() {
  return {
    open: false,
    isLoading: false,
    didSearch: false,
    position: {
      chrom: 'chr1',
      start: 60000,
      end: 65000,
      ref: '',
      alt: '',
    },
    results: [],
  }
}
function variantSearchReducer(state = createDefaultVariantSearch(), action) {
  switch (action.type) {
    case VARIANT_SEARCH.CLEAR: {
      return {
        ...state,
        didSearch: false,
        // position: { chrom: '', start: '', end: '' },
        results: []
      }
    }

    case VARIANT_SEARCH.OPEN: {
      return { ...state, open: true }
    }
    case VARIANT_SEARCH.CLOSE: {
      return { ...state, open: false }
    }
    case VARIANT_SEARCH.TOGGLE: {
      return { ...state, open: !state.open }
    }

    case VARIANT_SEARCH.SET_POSITION: {
      return { ...state, position: action.payload }
    }
    case VARIANT_SEARCH.SET_CHROM: {
      return { ...state, position: { ...state.position, chrom: action.payload } }
    }
    case VARIANT_SEARCH.SET_START: {
      return { ...state,
        position: { ...state.position,
          start: Number(action.payload),
          end: Number(action.payload) + 1
        }
      }
    }
    case VARIANT_SEARCH.SET_END: {
      return { ...state, position: { ...state.position, end: Number(action.payload) } }
    }
    case VARIANT_SEARCH.SET_REF: {
      return { ...state, position: { ...state.position, ref: action.payload } }
    }
    case VARIANT_SEARCH.SET_ALT: {
      return { ...state, position: { ...state.position, alt: action.payload } }
    }

    case VARIANT_SEARCH.SEARCH.REQUEST: {
      return { ...state, isLoading: true }
    }
    case VARIANT_SEARCH.SEARCH.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        didSearch: true,
        results: action.payload
      }
    }
    case VARIANT_SEARCH.SEARCH.ERROR: {
      return { ...state, isLoading: false }
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
      return { ...state, isLoading: false, isLoggedIn: true, initialCheck: true, user: action.payload, message: undefined }
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
    case DONOR.FIND_ALL.REQUEST: {
      return { ...state, isLoading: true }
    }
    case DONOR.FIND_ALL.RECEIVE: {
      const donors = action.payload
      const samples =
        indexBy(prop('id'),
          flatten(
            Object.values(action.payload)
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
    case DONOR.FIND_ALL.ERROR: {
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

function createDefaultPeers() {
  return {
    isLoading: false,
    data: [],
    message: undefined,
  }
}
function peersReducer(state = createDefaultPeers(), action) {
  switch (action.type) {
    case PEER.FIND_ALL.REQUEST: {
      return { ...state, isLoading: true }
    }
    case PEER.FIND_ALL.RECEIVE: {
      return { ...state, isLoading: false, data: action.payload }
    }
    case PEER.FIND_ALL.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case PEER.CREATE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case PEER.CREATE.RECEIVE: {
      return { ...state, isLoading: false, data: [...state.data, action.payload] }
    }
    case PEER.CREATE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case PEER.UPDATE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case PEER.UPDATE.RECEIVE: {
      return { ...state, isLoading: false, data: state.data.map(peer => peer.id === action.payload.id ? action.payload : peer) }
    }
    case PEER.UPDATE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    case PEER.REMOVE.REQUEST: {
      return { ...state, isLoading: true }
    }
    case PEER.REMOVE.RECEIVE: {
      return { ...state, isLoading: false, data: state.data.filter(peer => peer.id !== action.meta.id) }
    }
    case PEER.REMOVE.ERROR: {
      return { ...state, isLoading: false, message: action.payload  }
    }

    default:
      return state;
  }
}

function createDefaultGenes() {
  return {
    isLoading: false,
    search: '',
    data: [],
  }
}
function genesReducer(state = createDefaultGenes(), action) {
  switch (action.type) {
    case GENE.SET_SEARCH: {
      return { ...state, search: action.payload }
    }
    case GENE.CLEAR: {
      return { ...state, data: [] }
    }

    case GENE.SEARCH_BY_NAME.REQUEST: {
      return { ...state, isLoading: true }
    }
    case GENE.SEARCH_BY_NAME.RECEIVE: {
      return { ...state, isLoading: false, data: action.payload }
    }
    case GENE.SEARCH_BY_NAME.ERROR: {
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
  const genes = genesReducer(state.genes, action)
  const users = usersReducer(state.users, action)
  const peers = peersReducer(state.peers, action)
  const variantSearch = variantSearchReducer(state.variantSearch, action, data)

  // Initialize empty selections
  Object.keys(data.values).forEach(which => {
    if (!ui.selection[which])
      ui.selection[which] = []
  })

  return { ui, variantSearch, data, auth, genes, users, peers }
}
