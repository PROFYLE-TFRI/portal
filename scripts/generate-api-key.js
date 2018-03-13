/*
 * generate-api-key.js
 */
/* eslint-disable no-console */


const fs = require('fs')
const path = require('path')

module.exports = generateKey

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LENGTH = 15
const API_PATTERN = /apiKey: *['"]\w+['"]/

if (!module.parent)
  main()

function main() {
  const configPath = path.join(__dirname, '../config.js')

  if (!fs.existsSync(configPath)) {
    console.log('Config file doesnt exist. Make a copy of config.example.js as config.js.')
    process.exit(1)
  }

  const config = fs.readFileSync(configPath).toString()

  if (!API_PATTERN.test(config)) {
    console.log('Couldnt find apiKey property in ' + configPath)
    process.exit(2)
  }


  const newKey = generateKey()

  fs.writeFileSync(
    configPath,
    config.replace(API_PATTERN, `apiKey: '${newKey}'`)
  )

  console.log(newKey)
}


function generateKey() {
  let key = ''
  for (let i = 0; i < LENGTH; i++) {
    key += CHARS[Math.round(Math.random() * (CHARS.length - 1))]
  }
  return key
}
