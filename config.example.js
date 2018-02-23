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
  }
}
