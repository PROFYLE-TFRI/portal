/*
 * handlers.js
 */


exports.errorHandler = res => err => {
  res.json({ ok: false, message: err.toString(), stack: err.stack.split('\n') })
  res.end()
}

exports.okHandler = res => data => {
  res.json({ ok: true, data: data })
  res.end()
}

