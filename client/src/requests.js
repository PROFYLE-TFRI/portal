/*
 * requests.js
 */


export function fetchJSON(url) {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.ok ? Promise.resolve(res.data) : Promise.reject(res))
}
