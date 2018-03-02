/*
 * as-string.js
 */

export default function asString(value) {
  if (typeof value === 'string')
    return value
  if (value === undefined)
    return 'undefined'
  return JSON.stringify(value)
}
