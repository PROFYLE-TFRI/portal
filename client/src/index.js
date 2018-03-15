import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import React from 'react';
import { render, hydrate } from 'react-dom';
import { Provider } from 'react-redux';

import './styles.css';
import './polyfills';
// import registerServiceWorker from './registerServiceWorker';
import { doInitialFetch } from './actions';
import configureStore from './store'
import App from './components/App';
import * as actions from './actions'


const store = configureStore()

hydrate(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
)

const state = store.getState()

if (!state.auth.initialCheck)
  store.dispatch(actions.isLoggedIn())
    .then(isLoggedIn => {
      if (isLoggedIn)
        store.dispatch(doInitialFetch())
    })


// Register service worker

// if (window.location.protocol === 'https:')
  // registerServiceWorker()



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
