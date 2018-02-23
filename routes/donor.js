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

module.exports = router;
