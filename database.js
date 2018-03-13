/*
 * database.js
 */

const sqlite3 = require('sqlite3')

const config = require('./config')


const db = new sqlite3.Database(config.paths.database)

module.exports = {
  instance: db,
  run,
  insert,
  findOne,
  findAll,
}



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
