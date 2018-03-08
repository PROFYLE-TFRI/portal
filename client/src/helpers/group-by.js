/*
 * group-by.js
 */

export default function groupBy(selector, list) {
  if (list === undefined) {
    return list => groupBy(selector, list)
  }

  const result = {}
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const key = selector(item)
    if (!result[key])
      result[key] = []
    result[key].push(item)
  }
  return result
}
