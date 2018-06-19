/*
 * twilio.js
 */


const twilio = require('twilio')
const config = require('./config')

const client = config.twilio.account && config.twilio.token ? twilio(config.twilio.account, config.twilio.token) : undefined

module.exports = {
  sendMessage,
}

function sendMessage(to, body) {
  if (client === undefined)
    throw new Error('Twilio account not configured in config.js')

  return client.messages.create({
    from: config.twilio.from,
    to,
    body
  })
}
