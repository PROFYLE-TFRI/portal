/*
 * handlers.js
 */


exports.errorHandler = res => err => {
  res.json({ ok: false, message: err.toString(), stack: err.stack })
  res.end()
}

exports.okHandler = res => () => {
  res.json({ ok: true, data: null })
  res.end()
}

exports.dataHandler = res => data => {
  res.json({ ok: true, data: data })
  res.end()
}

exports.warningHandler = res => ([data, message]) => {
  const result = { ok: true, data }
  if (message && message.length > 0) {
    result.warning = true
    result.message = asString(message)
  }
  res.json(result)
  res.end()
}

function asString(value) {
  if (Array.isArray(value))
    return value.join('\n')
  return '' + value
}
