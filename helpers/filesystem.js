/*
 * filesystem.js
 */

const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')

const config = require('../config')


const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

exports.readDir = path => readDir(join(config.paths.data, path))
exports.readFile = path => readFile(join(config.paths.data, path))
exports.readJSON = path =>
  readFile(join(config.paths.data, path))
    .then(buffer => JSON.parse(buffer.toString()))
