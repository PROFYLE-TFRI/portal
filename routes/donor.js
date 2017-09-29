const express = require('express')
const router = express.Router()

const { okHandler, errorHandler } = require('../helpers/handlers')
const Donor = require('../models/donor')

// GET list
router.get('/list', (req, res, next) =>
  Donor.findAll()
    .then(okHandler(res))
    .catch(errorHandler(res)))

// GET by id
router.get('/:id', (req, res, next) =>
  Donor.find(req.params.id)
    .then(okHandler(res))
    .catch(errorHandler(res)))

module.exports = router;
