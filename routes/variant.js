const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const { forEachExperiment } = require('../helpers/donor')
const { getVariantsAt, getDistinctChroms } = require('../helpers/gemini')
const Donor = require('../models/donor')
const config = require('../config')

// POST search
router.use('/search', (req, res, next) => {
  const params = req.body // { chrom, start, end }

  Donor.findVariants(params)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

// GET chroms
router.use('/chroms', (req, res, next) => {
  Donor.findDistinctChroms()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router;
