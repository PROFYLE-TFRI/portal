const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Gene = require('../models/gene')

// GET list
router.use('/find-all', (req, res, next) =>
  Gene.findAll()
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// GET by id
router.use('/search-by-name/:name', (req, res, next) =>
  Gene.searchByName(req.params.name)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

module.exports = router;
