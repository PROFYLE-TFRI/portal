import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import './styles.css';
import registerServiceWorker from './registerServiceWorker';
import { rootReducer } from './reducers';
import { doInitialFetch } from './actions';
import App from './components/App';
import * as requests from './requests'
import * as actions from './actions'

window.requests = requests


const initialState = {}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store =
  (process.env.NODE_ENV === 'production')
  ? createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware))
  : createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunkMiddleware, createLogger())))

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
)

store.dispatch(actions.isLoggedIn())
  .then(isLoggedIn => {
    if (isLoggedIn)
      store.dispatch(doInitialFetch())
  })


// Register service worker

registerServiceWorker()



// HMR

if (module.hot) {
  module.hot.accept(['./components/App'], () => {
    const NextApp = require('./components/App').default;
    render(
      <Provider store={store}>
        <NextApp />
      </Provider>,
      document.querySelector('#root')
    );
  });
}
