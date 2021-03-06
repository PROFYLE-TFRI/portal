/*
 * server-node.js
 */


const path = require('path')
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const { hasAPIKey } = require('../helpers/auth')


const app = express()



/*
 * Setup
 */

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'jade')

app.use(helmet())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())


/*
 * Routes
 */

app.use('/files',     hasAPIKey, require('./routes/files'))
app.use('/api/donor', hasAPIKey, require('./routes/donor'))


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.json({
      ok: false,
      message: typeof err === 'string' ? err : JSON.stringify(err),
      meta: {
        url: req.originalUrl
      }
    })
    res.end()
    return
  }

  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})


module.exports = app
