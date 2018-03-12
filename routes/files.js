const express = require('express')
const range = require('express-range')
const router = express.Router()

const fs = require('../helpers/filesystem')


router.use(range({ accept: 'bytes' }))


// GET file
router.use('/', (req, res, next) => {
  if (req.url.includes('..')) {
    req.status(400)
    req.send('Invalid request')
    req.end()
    return
  }

  if (req.get('Range') === undefined)
    sendRequest(req, res)
  else
    sendRangeRequest(req, res)
})

function sendRequest(req, res) {
  const stream = fs.createReadStream(getPath(req.url))
  stream.on('open', () => {
    res.set('Content-Type', 'application/octet-stream')
    stream.pipe(res)
  })
  stream.on('error', err => {
    res.status(500)
    res.send(JSON.stringify(err))
    res.end()
  })
}

function sendRangeRequest(req, res) {
  const path = getPath(req.url)
  const start = req.range.first
  const end   = req.range.last

  fs.exists(path)
  .then(ok => {
    if (!ok) {
      res.status(404)
      res.send('File doesnt exist')
      res.end()
      return
    }

    return fs.stat(path)
  })
  .then(stat => {

    if (start > stat.size || end > stat.size) {
      res.status(400)
      res.send('Range out of bounds')
      res.end()
      return
    }

    const stream = fs.createReadStream(path, { start, end })
    stream.on('open', () => {
      res.range({
        first: start,
        last: end,
        length: stat.size,
      })
      res.set('Content-Type', 'application/octet-stream')
      stream.pipe(res)
    })
    stream.on('error', err => {
      res.status(500)
      res.send(JSON.stringify(err))
      res.end()
    })
  })
}

function getPath(url) {
  return url.replace(/\?.*$/, '')
}

module.exports = router;
