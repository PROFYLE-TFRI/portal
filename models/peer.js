/*
 * peer.js
 */

const axios = require('axios')

const db = require('../database.js')
const SQL = require('../helpers/sql.js')

module.exports = {
  findAll,
  findByID,
  create,
  update,
  remove,
  request,
}

function findAll() {
  return db.findAll('SELECT * FROM peers').then(peer => peer.map(deserialize))
}

function findByID(id) {
  return db.findOne('SELECT * FROM peers WHERE id = @id', { id }).then(deserialize)
}

function create(peer) {
  if (!/^[a-zA-Z0-9_-]+$/.test(peer.id))
    return Promise.reject(new Error(`ID can only use characters [a-zA-Z0-9_-]: got "${peer.id}"`))

  return db.insert(`
    INSERT INTO peers
    (id, url, apiKey, isActive)
    VALUES
    (@id, @url, @apiKey, @isActive)
    `, serialize(peer))
  .then(id => findByID(id))
}

function update(data) {
  if (!data.id)
    return Promise.reject(new Error('Update: .id field required'))

  return db.run(`
    UPDATE peers
       SET ${ SQL.getUpdateSet(data) }
     WHERE id = @id
    `, serialize(data))
  .then(() => findByID(data.id))
}

function remove(id) {
  return db.run(`
    DELETE FROM peers
     WHERE id = @id
    `, { id })
}

function request(req) {
  return findAll()
  .then(peers => {
    const activePeers = peers.filter(peer => peer.isActive)

    return Promise.all(
      activePeers.map(peer =>
        axios.request({
          url: peer.url + (req.originalUrl || req.url),
          method: req.method || 'get',
          headers: {
            ...(req.headers || {}),
            authorization: `APIKEY ${peer.apiKey}`
          },
          data: req.body,
        })
        .catch(err => Promise.resolve(err))
      )
    )
    .then(results => {

      const dataResults = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]

        if (result instanceof Error)
          return Promise.reject(result)

        const apiResult = result.data

        if (apiResult.ok === false)
          return Promise.reject(apiResult)

        apiResult.peer = activePeers[i]
        dataResults.push(apiResult)
      }

      return dataResults
    })
  })
}

// Helpers

function serialize(peer) {
  const serializedPeer = { ...peer }
  if ('isActive' in serializedPeer)
    serializedPeer.isActive = Number(peer.isActive)
  return serializedPeer
}

function deserialize(peer) {
  if (peer === undefined)
    return undefined
  return {
    ...peer,
    isActive: Boolean(peer.isActive),
  }
}
