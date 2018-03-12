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
    data: path.join(__dirname, 'data'),
    database: path.join(__dirname, 'data', 'app.db'),
  },

  /* Central Server Only */
  twilio: {
    account: 'AC05c9793739fbce19e2979e16e5bf0fe4',
    token: '44dc0cf650c9d609dd38ad6349ccfd44',
    from: '+15146002956',
  },

  /* Node Server Only */
  apiKey: 'KH876V56BKJ890SRE235',
}
