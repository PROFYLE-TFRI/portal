/*
 * get-diff-object.js
 */



export default function getDiffObject(previous, next) {
  const result = {
    id: next.id
  }
  for (let key in next) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key]))
      result[key] = next[key]
  }
  return result
}
