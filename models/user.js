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
  return db.findAll('SELECT * FROM users').then(user => user.map(u => deserialize(u, false)))
}

function findByID(id, keepPassword = false) {
  return db.findOne('SELECT * FROM users WHERE id = @id', { id }).then(u => deserialize(u, keepPassword))
}

function findByEmail(email, keepPassword = false) {
  return db.findOne('SELECT * FROM users WHERE email = @email', { email }).then(u => deserialize(u, keepPassword))
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
  .then(() => findByID(data.id))
}

function remove(id) {
  return db.run(`
    DELETE FROM users
     WHERE id = @id
    `, { id })
}

function comparePassword(user, password) {
  return bcrypt.compareSync(password, user.password)
}


// Helpers

function serialize(user) {
  const serializedUser = { ...user }
  if ('isAdmin' in serializedUser)
    serializedUser.isAdmin = Number(user.isAdmin)
  if ('permissions' in serializedUser)
    serializedUser.permissions = JSON.stringify(user.permissions)
  if ('password' in serializedUser)
    serializedUser.password = hash(user.password)
  return serializedUser
}

function deserialize(user, keepPassword = false) {
  if (user === undefined)
    return undefined
  return {
    ...user,
    password: keepPassword ? user.password : '',
    isAdmin: Boolean(user.isAdmin),
    permissions: JSON.parse(user.permissions),
  }
}

function hash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}
