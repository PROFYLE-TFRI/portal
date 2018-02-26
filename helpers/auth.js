/*
 * auth.js
 */

module.exports = {
  isLoggedIn,
  isAdmin,
}

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated())
    return notAuthenticated(res)
  next()
}

function isAdmin(req, res, next) {
  if (!req.isAuthenticated())
    return notAuthenticated(res)
  if (!req.user.isAdmin)
    return forbidden(res)
  next()
}


// Helpers

function notAuthenticated(res) {
  res.status(401)
  res.json({ ok: false, message: 'Not authenticated' })
  res.end()
}

function forbidden(res) {
  res.status(403)
  res.json({ ok: false, message: 'Not authorized to access this' })
  res.end()
}