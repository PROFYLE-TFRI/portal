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

