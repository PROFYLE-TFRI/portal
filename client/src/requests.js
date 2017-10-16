/*
 * requests.js
 */


export function fetchJSON(url) {
  return fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(res => res.ok ? Promise.resolve(res.data) : Promise.reject(res))
}

export function fetchAPI(url) {
  return fetchJSON(process.env.PUBLIC_URL + url)
}
