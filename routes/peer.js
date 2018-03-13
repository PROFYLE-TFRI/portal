const express = require('express')
const router = express.Router()

const { okHandler, dataHandler, errorHandler } = require('../helpers/handlers')
const { isAdmin } = require('../helpers/auth')
const Peer = require('../models/peer')

// GET list
router.get('/find-all', (req, res, next) =>
  Peer.findAll()
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST create
router.post('/create', isAdmin, (req, res, next) =>
  Peer.create(req.body)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST update
// Only for admins, or for self (and self can't modify isAdmin & permissions)
router.post('/update', isAdmin, (req, res, next) =>
  Peer.update(req.body)
    .then(dataHandler(res))
    .catch(errorHandler(res)))

// POST remove
router.post('/remove/:id', isAdmin, (req, res, next) =>
  Peer.remove(req.params.id)
    .then(okHandler(res))
    .catch(errorHandler(res)))

module.exports = router;
