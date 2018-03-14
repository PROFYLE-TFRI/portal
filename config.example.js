/*
 * config.example.js
 *
 * This is an example configuration. The application requires a similar file,
 * named 'config.js' in the same folder as this one, in order to work.
 */

const path = require('path')

module.exports = {
  paths: {
    input: '/home/rgregoir/projects/profyle-metadata/root_folder_example',
    data:     path.join(__dirname, 'data'),
    database: path.join(__dirname, 'data', 'app.db'),
  },

  isCentral: true, /* if this is a central server */
  isNode:    true, /* if this is a node server */

  /* Central Server Only */
  enable2fa: false,
  twilio: {
    account: 'TWILIO_ACCOUNT',
    token:   'TWILIO_TOKEN',
    from: '+15146002956',
  },

  /* Node Server Only */
  apiKey: 'KH876V56BKJ890SRE235',
}
