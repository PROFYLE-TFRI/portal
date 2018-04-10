const express = require('express')
const range = require('express-range')
const router = express.Router()
const axios = require('axios')

const Peer = require('../models/peer')


router.use(range({ accept: 'bytes' }))


// GET file
router.use('/:peerID', (req, res, next) => {
  const { peerID } = req.params
  const url = req.url

  Peer.findByID(peerID)
  .then(peer =>
    axios.request({
      url: peer.url + '/files' + url,
      method: req.method,
      responseType: 'arraybuffer',
      headers: {
        ...req.headers,
        authorization: `APIKEY ${peer.apiKey}`
      }
    })
  )
  .then(response => {
    res.status(response.status)
    for (const header in response.headers) {
      if (!/content-length/i.test(header))
        res.set(header, response.headers[header])
    }
    res.set('content-type', 'application/octet-stream')
    res.set('transfer-encoding', 'chunked')
    res.write(response.data)
    res.end()
  })
  .catch(err => {
    let message = err.message

    // Carry message from node if available
    if (err.response && err.response.data)
      message = err.response.data.toString()

    res.status(500)
    res.statusMessage = err.message
    res.send(message)
    res.end()
  })
})

module.exports = router;
