const express = require('express')
const range = require('express-range')
const router = express.Router()

const fs = require('../helpers/filesystem')


router.use(range({ accept: 'bytes' }))


// GET file
router.use('/', (req, res, next) => {

  if (!req.range || !req.range.first || !res.range.last) {
    res.status(400)
    res.send('Not a range request')
    res.end()
    return
  }


  const start = req.range.first
  const end   = req.range.last

  fs.exists(req.url)
  .then(ok => {
    if (!ok) {
      res.status(404)
      res.send('File doesnt exist')
      res.end()
      return
    }

    return fs.stat(req.url)
  })
  .then(stat => {
    console.log(stat.size)
    console.log(req.range)

    if (start > stat.size || end > stat.size) {
      res.status(400)
      res.send('Range out of bounds')
      res.end()
      return
    }

    const stream = fs.createReadStream(req.url, { start, end })
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
      res.send(JSON.stringify())
      res.end()
    })
  })
})

module.exports = router;
