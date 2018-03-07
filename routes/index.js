const fs = require('fs')
const path = require('path')
const url = require('url')
const express = require('express')
const router = express.Router()
const React = require('react')
const { renderToString } = require('react-dom/server')
const { Provider } = require('react-redux')

const Donor = require('../models/donor')
const User = require('../models/user')
const configureStore = require('../client/dist/store').default
const App = require('../client/dist/components/App').default

const indexHTML = fs.readFileSync(path.join(__dirname, '../public/index.html')).toString()

// Render index.html
router.use('/', (req, res, next) => {
  const pathname = url.parse(req.url).pathname
  const isIndex = pathname === '/' || pathname === '/index.html'

  if (!isIndex)
    return next()

  const isAuthenticated = req.isAuthenticated()
  const isAdmin = isAuthenticated && req.user.isAdmin

  Promise.all([
    req.user,
    isAuthenticated ? Donor.findAll() : undefined,
    isAdmin ?         User.findAll() : undefined,
  ])
  .then(([user, donors, users]) => {

    const store = configureStore(user, donors, users)
    const html = renderToString(
      <Provider store={store}>
        <App />
      </Provider>,
    )

    const pageHTML = indexHTML
      .replace('"{{SSR_JSON}}"', `window.__PRELOADED_STATE__ = ${JSON.stringify(store.getState())}`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    res.send(pageHTML)
    res.end()
  })
})

module.exports = router;
