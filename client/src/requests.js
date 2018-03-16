/*
 * requests.js
 */

import axios from 'axios'

export const donor = {
  findAll:        ()       => get('/donor/find-all'),
  findByID:       (id)     => get(`/donor/find-by-id/${id}`),
  searchVariants: (position) => post('/donor/search-variants', position),
  listChroms:     ()       => post('/donor/list-chroms'),
}

export const gene = {
  searchByName:   (name)   => get(`/gene/search-by-name/${name}`),
}

export const user = {
  findAll:  ()     => get('/user/find-all'),
  findByID: (id)   => get(`/user/find-by-id/${id}`),
  create:   (user) => post('/user/create', user),
  update:   (user) => post('/user/update', user),
  remove:   (id)   => post(`/user/remove/${id}`),
}

export const peer = {
  findAll:  ()     => get('/peer/find-all'),
  create:   (peer) => post('/peer/create', peer),
  update:   (peer) => post('/peer/update', peer),
  remove:   (id)   => post(`/peer/remove/${id}`),
}

export const auth = {
  logIn:      (email, password, code) => post('/auth/login', { email, password, code }),
  logOut:     () => post('/auth/logout'),
  isLoggedIn: () => post('/auth/is-logged-in'),
}

function fetchAPI(method, route, data) {
  return axios.request({
      method: method,
      url: process.env.PUBLIC_URL + '/api' + route,
      data: data,
      withCredentials: true,
    })
    .then(result => {
      const apiResult = result.data

      if (apiResult.ok && !apiResult.warning)
        return Promise.resolve(apiResult.data)
      else if (apiResult.warning)
        return Promise.reject(createWarning(apiResult))
      else
        return Promise.reject(createError(apiResult))
    })
}
function get(route)        { return fetchAPI('get',  route, undefined) }
function post(route, data) { return fetchAPI('post', route, data) }

function createError(apiResult) {
  const error = new Error(apiResult.message)
  error.stack = apiResult.stack
  error.fromAPI = true
  return error
}

function createWarning(apiResult) {
  const error = new Error(apiResult.message)
  error.message = apiResult.message
  error.fromAPI = true
  error.warning = true
  error.data = apiResult.data
  return error
}

