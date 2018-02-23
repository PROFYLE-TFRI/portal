const express = require('express')
const router = express.Router()

const { okHandler, dataHandler, errorHandler } = require('../helpers/handlers')
const User = require('../models/user')

// GET list
router.get('/find-all', (req, res, next) =>
  User.findAll()
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// GET by id
router.get('/find-by-id/:id', (req, res, next) =>
  User.findByID(req.params.id)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST create
router.post('/create', (req, res, next) =>
  User.create(req.body)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST update
router.post('/update', (req, res, next) =>
  User.update(req.body)
    .then(okHandler(res))
    .catch(errorHandler(res)))

// POST remove
router.post('/remove/:id', (req, res, next) =>
  User.remove(req.params.id)
    .then(okHandler(res))
    .catch(errorHandler(res)))

module.exports = router;
