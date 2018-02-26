/*
 * 2fa-manager.js
 */

const twilio = require('../twilio')

const cache = {}


module.exports = {
  sendCode,
  isValid,
}

function sendCode(user) {
  const code = generateCode()
  return twilio.sendMessage(user.phone, code)
    .then(() => {
      cache[code] = user.id
      setTimeout(() => delete cache[code], 10 * 60 * 1000) // 10 minutes
    })
}

function isValid(code, user) {
  return code in cache && cache[code] === user.id
}


// Helpers

function generateCode() {
  let code = ''
  for (let i = 0; i < 6; i++)
    code += Math.round(Math.random() * 9)
  return code
}
