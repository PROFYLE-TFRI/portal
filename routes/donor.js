const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Peer = require('../models/peer')

// Export these
router.findAll = findAll
router.searchVariants = searchVariants
router.listChroms = listChroms

function findAll() {
  return Peer.request({ url: '/api/donor/find-all' })
  .then(results => {

    const finalData = {}
    results.forEach(({ peer, data }) => {
      Object.values(data).forEach(donor => {
        donor.source = peer.id
        finalData[donor.id] = donor
      })
    })

    return finalData
  })
}

function searchVariants(params) {
  return Peer.request({ method: 'post', url: '/api/donor/search-variants', body: params })
  .then(results => {

    const finalData = []
    results.forEach(({ peer, data }) => {
      data.forEach(match => {
        match.source = peer.id
        finalData.push(match)
      })

    })

    return finalData
  })
}

function listChroms() {
  return Peer.request({ url: '/api/donor/list-chroms' })
  .then(results => {

    const finalData = Array.from(new Set(results.reduce((acc, cur) => acc.concat(cur.data))))

    return finalData
  })
}


// GET list
router.get('/find-all', (req, res, next) => {
  findAll()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

// POST search
router.use('/search-variants', (req, res, next) => {
  searchVariants(req.body)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

// GET chroms
router.use('/list-chroms', (req, res, next) => {
  listChroms()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router;
