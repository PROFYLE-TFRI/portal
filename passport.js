/*
 * passport.js
 */

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const k = require('./client/src/shared-constants')
const TwoFA = require('./helpers/2fa-manager')
const User = require('./models/user')
const config = require('./config')

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// used to deserialize the user
passport.deserializeUser((id, done) => {
  User.findByID(id, true)
    .then(user => done(null, user))
    .catch(err => done(err, null))
})

const localStrategyOptions = {
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
}

// LOCAL LOGIN =============================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy(localStrategyOptions, (req, email, password, done) => {

  User.findByEmail(email, true)
    .then(user => {
      // if no user is found, return the message
      if (!user)
        return done(null, false, k.AUTH.WRONG_USER_OR_PASSWORD)

      // if the user is found but the password is wrong
      if (!User.comparePassword(user, password))
        return done(null, false, k.AUTH.WRONG_USER_OR_PASSWORD)

      // check if we need to 2fa
      if (config.enable2fa && !req.body.code)
        return TwoFA.sendCode(user)
          .then(() => done(null, false, k.AUTH.REQUIRES_2FA))
          .catch(err => done(err, null))

      // check if 2fa is valid
      if (req.body.code && !TwoFA.isValid(req.body.code, user))
        return done(null, false, k.AUTH.INVALID_2FA)

      // All is well, return successful user
      User.update({ id: user.id, lastLogin: new Date().toISOString() })
      return done(null, user, null)
    })
    .catch(err => {
      done(err, null)
    })

}))

// LOCAL SIGNUP (not used) =================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy(localStrategyOptions, (req, email, password, done) => {

  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
  User.findByEmail(email)
    .then(user => {

      // check to see if theres already a user with that email
      if (user) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
      }

      return User.create()
        .then(newUser => {
          done(null, newUser)
        })
    })
    // if there are any errors, return the error
    .catch(err => {
      done(err)
    })

}))

module.exports = passport
