import 'bootstrap/dist/css/bootstrap.css';
/* font-awesome is also used by IGV.js */
import 'font-awesome/css/font-awesome.min.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import React from 'react';
import { render, hydrate } from 'react-dom';
import { Provider } from 'react-redux';

import './styles/index.css';
import './polyfills';
import registerServiceWorker from './registerServiceWorker';
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


document.addEventListener('focus', ev => {
  if (ev.target.tagName === 'INPUT')
    ev.target.select()
}, true)

// Register service worker

if (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
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
