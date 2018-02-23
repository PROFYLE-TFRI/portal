/*
 * user.js
 */

const bcrypt = require('bcrypt-nodejs')

const db = require('../database.js')
const SQL = require('../helpers/sql.js')

module.exports = {
  findAll,
  findByID,
  findByEmail,
  create,
  update,
  remove,
  comparePassword,
}

function findAll() {
  return db.findAll('SELECT * FROM users').then(deserialize)
}

function findByID(id) {
  return db.findOne('SELECT * FROM users WHERE id = @id', { id }).then(deserialize)
}

function findByEmail(email) {
  return db.findOne('SELECT * FROM users WHERE email = @email', { email }).then(deserialize)
}

function create(user) {
  return db.insert(`
    INSERT INTO users
    (name, email, phone, password, isAdmin, permissions)
    VALUES
    (@name, @email, @phone, @password, @isAdmin, @permissions)
    `, serialize(user))
  .then(id => findByID(id))
}

function update(data) {
  if (!data.id)
    return Promise.reject(new Error('Update: .id field required'))

  return db.run(`
    UPDATE users
       SET ${ SQL.getUpdateSet(data) }
     WHERE id = @id
    `, serialize(data))
}

function remove(id) {
  return db.run(`
    DELETE FROM users
     WHERE id = @id
    `, { id })
}

function comparePassword(user, password) {
  return bcrypt.compareSync(user.password, password)
}


// Helpers

function serialize(user) {
  const serializedUser = { ...user }
  if ('isAdmin' in serializedUser)
    serializedUser.isAdmin = Number(user.isAdmin)
  if ('permissions' in serializedUser)
    serializedUser.permissions = JSON.stringify(user.permissions)
  if ('password' in serializedUser)
    serializedUser.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null)
  return serializedUser
}

function deserialize(user) {
  return {
    ...user,
    isAdmin: Boolean(user.isAdmin),
    permissions: JSON.parse(user.permissions),
  }
}
