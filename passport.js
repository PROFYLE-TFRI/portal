/*
 * passport.js
 */

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('./models/user')

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
  User.findByID(id)
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

  User.findByEmail(email)
    .then(user => {
      // if no user is found, return the message
      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.')) // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!User.comparePassword(user, password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')) // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user)
    })
    .catch(err => {
      done(err)
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
