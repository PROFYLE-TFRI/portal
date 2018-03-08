const { join } = require('path')
const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const { forEachExperiment } = require('../helpers/donor')
const { getVariantsAt } = require('../helpers/gemini')
const Donor = require('../models/donor')
const config = require('../config')

// POST search
router.use('/search', (req, res, next) => {
  const params = req.body // { chrom, start, end }

  console.log(params)
  Donor.findAll()
  .then(donors => {
    const results = []
    forEachExperiment(donors, (experiment, sample, donor) => {
      experiment.variants.forEach(file => {
        results.push(
          getVariantsAt(join(config.paths.input, file), params)
          .then(variants => ({
            experimentID: experiment.id,
            sampleID: sample.id,
            donorID: donor.id,
            file,
            variants
          }))
        )
      })
    })
    return Promise.all(results)
  })
  .then(results => results.filter(r => r.variants.length > 0))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

// GET by id
router.get('/find-by-id/:id', (req, res, next) =>
  Donor.findByID(req.params.id)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

module.exports = router;
