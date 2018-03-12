/*
 * requests.js
 */

import axios from 'axios'

export const donor = {
  findAll:        ()       => get('/donor/find-all'),
  findByID:       (id)     => get(`/donor/find-by-id/${id}`),
  searchVariants: (params) => post('/donor/search-variants', params),
  listChroms:     ()       => post('/donor/list-chroms'),
}

export const user = {
  findAll:  ()     => get('/user/find-all'),
  findByID: (id)   => get(`/user/find-by-id/${id}`),
  create:   (user) => post('/user/create', user),
  update:   (user) => post('/user/update', user),
  remove:   (id)   => post(`/user/remove/${id}`),
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

      if (apiResult.ok)
        return Promise.resolve(apiResult.data)
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
