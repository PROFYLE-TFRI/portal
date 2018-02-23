const express = require('express')
const router = express.Router()

const { okHandler } = require('../helpers/handlers')
const passport = require('../passport')

// POST pass login request to passport
router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}))

// POST logout
router.use('/logout', (req, res) => {
  req.logout()
  okHandler(res)()
})

// GET check if user is logged in
router.use('/is-logged-in', (req, res) => {
  okHandler(res)(req.isAuthenticated())
})

module.exports = router;
