/*
 * gene.js
 */


const db = require('../database.js')

module.exports = {
  findAll,
  searchByName,
}

const LIMIT = 50

function findAll() {
  return db.findAll(`SELECT * FROM genes LIMIT ${LIMIT}`)
}

function searchByName(name) {
  return db.findAll(
    `SELECT *
       FROM genes
      WHERE name LIKE @name
      LIMIT ${LIMIT}`,
    { name: name + '%' }
  )
}
