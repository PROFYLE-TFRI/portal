/*
 * gene.js
 */


const db = require('../database.js')

module.exports = {
  searchByName,
}

const LIMIT = 50

function searchByName(name) {
  return db.findAll(
    `SELECT *
       FROM genes
      WHERE name LIKE @name
      LIMIT ${LIMIT}`,
    { name: name + '%' }
  )
}
