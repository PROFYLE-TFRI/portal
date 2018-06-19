/*
 * setup-database.js
 */
/* eslint-disable no-console */

const fs = require('fs')
const chalk = require('chalk')

const db = require('./database')
const Peer = require('./models/peer')
const config = require('./config')

module.exports = db.findAll('SELECT * FROM sqlite_master')
.then(rows => {

  // Tables already exist
  if (rows.length !== 0) {
    console.log(chalk.bold(`Re-opening database (${config.paths.database})`))
    return
  }

  // Split table creation statements & run them
  const statements = fs.readFileSync('./tables.sql').toString()
    .replace(/(\/\*(\n|[^\n])*?\*\/)|(--[^\n]*)/gm, '') // remove comments
    .split(';')

  const actions = []
  db.instance.serialize(() => {
    statements.forEach(s => {
      actions.push(
        db.run(s)
          .catch(err => err.code === 'SQLITE_MISUSE' ? // Empty statement
              Promise.resolve()
            : Promise.reject(err)))
    })
  })

  Promise.all(actions)
    .then(() => console.log(chalk.green.bold('Created SQL tables')))
    .then(() => {
      if (config.isNode) {
        return Peer.create({
            id: 'local',
            url: 'http://localhost:' + (process.env.NODE_PORT || '3002'),
            apiKey: config.apiKey,
            isActive: true
          })
          .then(() => console.log(chalk.green.bold('Inserted self as peer')))
      }
    })
    .catch(err => {
      console.error(chalk.red.bold(err.code + ': ' + err.message))
      console.error(err.stack)
      process.exit(1)
    })
})
