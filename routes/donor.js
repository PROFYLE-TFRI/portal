const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Donor = require('../models/donor')

// GET list
router.get('/find-all', (req, res, next) =>
  Donor.findAll()
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// GET by id
router.get('/find-by-id/:id', (req, res, next) =>
  Donor.findByID(req.params.id)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST search
router.use('/search-variants', (req, res, next) => {
  const params = req.body // { chrom, start, end }

  Donor.searchVariants(params)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

// GET chroms
router.use('/list-chroms', (req, res, next) => {
  Donor.listChroms()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router;
