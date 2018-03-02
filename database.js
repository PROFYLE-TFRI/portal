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

  // Tables already exist
  if (rows.length !== 0)
    return

  // Split table creation statements & run them
  const statements = fs.readFileSync('./tables.sql').toString().split(';')
  const actions = []
  db.serialize(() => {
    statements.forEach(s => {
      actions.push(
        run(s)
          .catch(err => err.code === 'SQLITE_MISUSE' ? // Empty statement
              Promise.resolve()
            : Promise.reject(err)))
    })
  })
  /* eslint-disable no-console */
  Promise.all(actions)
    .then(() => console.log('Created SQL tables'))
    .catch(err => {
      console.log(err.code)
      console.error(err)
      process.exit(1)
    })
  /* eslint-enable no-console */
})


function run(query, params = {}) {
  return new Promise((resolve, reject) => {
    console.log(require('util').inspect(query, { colors: true, depth: 3 }))
    console.log(require('util').inspect(addAtSign(params), { colors: true, depth: 3 }))
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
    db.run(query, addAtSign(params, true), function(err) {
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

function addAtSign(object, forInsert = false) {
  const result = {}
  for (let key in object) {
    if (forInsert && key === 'id')
      continue
    result['@' + key] = object[key]
  }
  return result
}
