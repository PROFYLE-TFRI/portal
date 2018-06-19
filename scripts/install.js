/*
 * install.js
 */
/* eslint-disable no-console */


const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const inquirer = require('inquirer')
const chalk = require('chalk')
const clipboardy = require('clipboardy')

const generateAPIKey = require('./generate-api-key')

const configPath = path.join(__dirname, '../config.js')

const prompt = inquirer.createPromptModule()


// Load current config if it exists to populate defaults

const config = fs.existsSync(configPath) ? require(configPath) : {}
config.paths = config.paths || {}
config.twilio = config.twilio || {}

const opt = (a, b) => a !== undefined ? a : b


// Questions

const isCentral = options => options.isCentral
const has2FA = options => options.isCentral && options.enable2fa

const questions = [
  { name: 'overwrite', message: 'A config.js already exists. Would you like to overwrite it?', type: 'confirm', default: true, when: options => fs.existsSync(configPath) },

  { name: 'input', message: 'Which is the root folder of your data?', default: opt(config.paths.input, '~/portal_data'), filter: input => input.replace('~', process.env.HOME) },
  { name: 'createDirectory', message: 'That directory doesn\'t exist. Would you like to create it?', type: 'confirm', default: true, when: options => !fs.existsSync(options.input) },

  { name: 'isNode', message: 'Is this a node server? (a server which serves data for the portal)', type: 'confirm', default: opt(config.isNode, true) },

  { name: 'isCentral',      message: 'Is this a central server? (a server that runs the actual profyle portal)',    type: 'confirm', default: opt(config.isCentral, false) },
  { name: 'enable2fa',      message: 'Is 2-factor authentication enabled? (requires a twilio account)', type: 'confirm', default: opt(config.enable2fa, false), when: isCentral },
  { name: 'twilio.account', message: 'What is your twilio account number?', type: 'input',   default: opt(config.twilio.account, 'xxxxx'),        when: has2FA },
  { name: 'twilio.token',   message: 'What is your twilio token?',          type: 'input',   default: opt(config.twilio.token,   'xxxxx'),        when: has2FA },
  { name: 'twilio.from',    message: 'What is your twilio phone?',          type: 'input',   default: opt(config.twilio.from,    '+15146002956'), when: has2FA },
  { name: 'genesFile',      message: 'If you want to load the genes file right now, enter its path (or leave empty)', type: 'input',              when: isCentral, filter: input => input.replace('~', process.env.HOME) },

  { name: 'admin.name',     message: 'Please enter the admin account name',  type: 'input', default: 'Admin', when: isCentral, },
  { name: 'admin.email',    message: 'Please enter the admin account email', type: 'input',                   when: isCentral, },
  { name: 'admin.phone',    message: 'Please enter the admin account phone', type: 'input',                   when: isCentral, },

]


// Main

prompt(questions)
.then(async options => {

  if (!options.input)
    abort('Input directory required')

  if (!options.isCentral && !options.isNode)
    abort('This must be a central server, a node server or both, but not none of these choices.')

  if (fs.existsSync(configPath) && !options.overwrite)
    abort('Not overwriting config.js')

  // Print line to separate questions from report
  console.log('')

  if (options.isCentral) {
    console.log(chalk.bold('Building profyle portal frontend... (wait a moment)'))
    execSync('npm run build', { cwd: path.join(__dirname, '..') })

    console.log(chalk.bold('Setting up database...'))
    await require('../setup-database.js')

    console.log(chalk.bold('Creating admin...'))
    const db = require('../database.js')
    const User = require('../models/user.js')

    await db.run('DELETE FROM users WHERE email = @email', { email: options.admin.email })
    await User.insert({
      name: options.admin.name,
      email: options.admin.email,
      phone: options.admin.phone,
      isAdmin: true,
      permissions: '[]',
    })
  }

  if (options.createDirectory) {
    try {
      fs.mkdirSync(options.input)
      console.log(chalk.bold(`Created directory ${options.input} `) + chalk.yellow.bold('Don\'t forget to populate it!'))
    } catch(err) {
      abort(`Couldn't create directory ${options.input}: ${err.toString()}`)
    }
  } else if (!fs.existsSync(options.input)) {
    console.log(chalk.bold(`Directory ${options.input} doesn't exist. `) + chalk.yellow.bold('Don\'t forget to create it!'))
  }

  if (options.isNode)
    options.apiKey = config.apiKey || generateAPIKey()

  fs.writeFileSync(configPath, createConfig(options))

  if (options.isNode) {
    let copied = false

    try {
      clipboardy.writeSync(options.apiKey)
      copied = true
    } catch(err) { /* ignore */ }

    console.log(chalk.bold('Your randomly generated API key is ' + chalk.blue(options.apiKey) + (copied ? ' (Copied to clipboard) ' : '')))
    console.log(chalk.yellow.bold(`  Send it to us! (mailto:romain.gregoire@mcgill.ca?subject=Profyle+Node&body=Key:+${options.apiKey})`))
  }

  console.log(chalk.green.bold('config.js written'))

  if (options.genesFile) {

    if (!fs.existsSync(options.genesFile))
      abort('Genes file does not exist. Load it later with ' + chalk.white('node ./scripts/load-genes-file.js [file]'))

    if (!/\.bed$/.test(options.genesFile))
      abort('Genes file extension is not .bed. Is it a bed file? Load it later with ' + chalk.white('node ./scripts/load-genes-file.js [file]'))

    console.log('Loading genes file...')
    const loadGenesFile = require('./load-genes-file')
    return loadGenesFile(options.genesFile)
      .then(rowsInserted => {
        console.log(chalk.green.bold(`Finished loading genes. Inserted ${rowsInserted} rows`))
      })
  }
})
.catch(err => {
  abort(`Caught error: ${err.toString()}`)
})


/**
 * Creates a config.js string
 * @param {Object} options config options
 */
function createConfig(options) {
  options.twilio = options.twilio || {}
  return `/*
 * config.js
 *
 * This is the configuration file for your profyle node.
 */

const path = require('path')

module.exports = {
  paths: {
    input:    ${stringify(options.input)},
    data:     path.join(__dirname, 'data'),
    database: path.join(__dirname, 'data', 'app.db'),
  },

  isCentral: ${stringify(options.isCentral)}, /* if this is a central server */
  isNode:    ${stringify(options.isNode)}, /* if this is a node server */

  /* Central Server options */
  enable2fa: ${stringify(options.enable2fa)},
  twilio: {
    account: ${stringify(opt(options.twilio.account, config.twilio.account))},
    token:   ${stringify(opt(options.twilio.token, config.twilio.token))},
    from:    ${stringify(opt(options.twilio.from, config.twilio.from))},
  },

  /* Node Server options */
  apiKey: ${stringify(options.apiKey)},
}
`
}

function stringify(value) {
  if (value === undefined)
    return 'null'
  return JSON.stringify(value)
}

function abort(message) {
  console.error(chalk.red.bold(message))
  process.exit(1)
}
