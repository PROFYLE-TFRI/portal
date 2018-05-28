const fs = require('fs')
const path = require('path')
const url = require('url')
const express = require('express')
const router = express.Router()
const React = require('react')
const { renderToString } = require('react-dom/server')
const { Provider } = require('react-redux')

const Donor = require('./donor') /* requiring ./routes/donor.js, not ./models/donor.js */
const Peer = require('../models/peer')
const User = require('../models/user')

const configureStore = require('../client/dist/store').default
const App = require('../client/dist/components/App').default

// Load index.html template
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
    isAuthenticated ? Donor.findAll() : [[], []],
    isAdmin ?         User.findAll() : undefined,
    isAdmin ?         Peer.findAll() : undefined,
  ])
  .then(([user, donorsResult, users, peers]) => {

    const store = configureStore(
      user,
      donorsResult[0],
      users,
      peers,
      donorsResult[1]
    )
    const html = renderToString(
      <Provider store={store}>
        <App />
      </Provider>,
    )

    const pageHTML = indexHTML
      .replace('"{{SSR_JSON}}"', JSON.stringify(store.getState()))
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    res.send(pageHTML)
    res.end()
  })
  .catch(err => {
    console.error(err)
    // Send to the application error handler
    next(err)
  })
})

module.exports = router;
