/*
 * polyfills.js
 */


// Safari <10
Object.values = Object.values || function values(o) {
  let result = []
  for (const key in o) {
    result.push(o[key])
  }
  return result
}
