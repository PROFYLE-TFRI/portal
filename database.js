/*
 * database.js
 */

const fs = require('fs')
const sqlite3 = require('sqlite3')

const config = require('./config')

module.exports = {
  run,
  insert,
  findOne,
  findAll,
}

const db = new sqlite3.Database(config.paths.database)

findAll('SELECT * FROM sqlite_master')
.then(rows => {
  /* eslint-disable no-console */
  if (rows.length === 0)
    run(fs.readFileSync('./tables.sql').toString())
      .then(changes => console.log('Created SQL tables'))
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  /* eslint-enable no-console */
})


function run(query, params = {}) {
  return new Promise((resolve, reject) => {
    db.run(query, addAtSign(params), function(err) {
      if (err)
        reject(err)
      else
        resolve(this.changes)
    })
  })
}

function insert(query, params = {}) {
  return new Promise((resolve, reject) => {
    db.run(query, addAtSign(params), function(err) {
      if (err)
        reject(err)
      else
        resolve(this.lastID)
    })
  })
}

function findOne(query, params = {}) {
  return new Promise((resolve, reject) => {
    db.get(query, addAtSign(params), function(err, row) {
      if (err)
        reject(err)
      else
        resolve(row)
    })
  })
}

function findAll(query, params = {}) {
  return new Promise((resolve, reject) => {
    db.all(query, addAtSign(params), function(err, rows) {
      if (err)
        reject(err)
      else
        resolve(rows)
    })
  })
}


// Helpers

function addAtSign(object) {
  const result = {}
  for (let key in object) {
    result['@' + key] = object[key]
  }
  return result
}
