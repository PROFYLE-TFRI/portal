/*
 * twilio.js
 */


const twilio = require('twilio')
const config = require('./config')

const client = twilio(config.twilio.account, config.twilio.token)

module.exports = {
  sendMessage,
}

function sendMessage(to, body) {
  return client.messages.create({
    from: config.twilio.from,
    to,
    body
  })
}
