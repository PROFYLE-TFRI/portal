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

// Chrome <51
Object.entries = Object.entries || function entries(o) {
  let result = []
  for (const key in o) {
    result.push([key, o[key]])
  }
  return result
}
