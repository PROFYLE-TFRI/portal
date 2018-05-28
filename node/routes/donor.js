const express = require('express')
const router = express.Router()

const { warningHandler, dataHandler, errorHandler } = require('../../helpers/handlers')
const Donor = require('../../models/donor')

// GET list
router.use('/find-all', (req, res, next) =>
  Donor.findAll()
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST search
router.use('/search-variants', (req, res, next) => {
  const params = req.body // { chrom, start, end, ref, alt }

  Donor.searchVariants(params)
    .then(warningHandler(res))
    .catch(errorHandler(res))
})

// GET chroms
router.use('/list-chroms', (req, res, next) => {
  Donor.listChroms()
    .then(warningHandler(res))
    .catch(errorHandler(res))
})

module.exports = router;
