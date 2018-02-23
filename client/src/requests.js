/*
 * requests.js
 */

import axios from 'axios'

export const donor = {
  findAll:  ()     => get('/donor/find-all'),
  findByID: (id)   => get(`/donor/find-by-id/${id}`),
}

export const user = {
  findAll:  ()     => get('/user/find-all'),
  findByID: (id)   => get(`/user/find-by-id/${id}`),
  create:   (user) => post('/user/create', user),
  update:   (user) => post('/user/update', user),
  remove:   (id)   => get(`/user/remove/${id}`),
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
        return Promise.reject(new Error(apiResult.message))
    })
}
function get(route)        { return fetchAPI('get',  route, undefined) }
function post(route, data) { return fetchAPI('post', route, data) }
