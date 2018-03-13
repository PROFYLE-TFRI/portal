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

const questions = [
  { name: 'input', message: 'Which is the root folder of your data?', filter: input => input.replace('~', process.env.HOME) },
  { name: 'createDirectory', message: 'That directory doesn\'t exist. Would you like to create it?', type: 'confirm', default: true, when: options => !fs.existsSync(options.input) },

  { name: 'isNode', message: 'Is this a node server? (a server which serves data for the portal)', type: 'confirm', default: true },

  { name: 'isCentral',      message: 'Is this a central server? (a server that runs the actual profyle portal)',    type: 'confirm', default: false },
  { name: 'twilio.account', message: 'What is your twilio account?', type: 'input',    default: 'xxxxx', when: options => options.isCentral },
  { name: 'twilio.token',   message: 'What is your twilio token?',   type: 'input',    default: 'xxxxx', when: options => options.isCentral },
  { name: 'twilio.phone',   message: 'What is your twilio phone?',   type: 'input',    default: '+15146002956', when: options => options.isCentral },

  { name: 'overwrite', message: 'A config.js already exists. Would you like to overwrite it?', type: 'confirm', default: true, when: options => fs.existsSync(configPath) },
]

prompt(questions)
.then(options => {

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
    options.apiKey = generateAPIKey()

  fs.writeFileSync(configPath, createConfig(options))

  if (options.isNode) {
    clipboardy.writeSync(options.apiKey)
    console.log(chalk.bold('Your randomly generated API key is ' + chalk.blue(options.apiKey) + ' (Copied to clipboard) '))
    console.log(chalk.yellow.bold('  Send it to us! (mailto:romain.gregoire@mcgill.ca)'))
  }

  console.log(chalk.green.bold('config.js written'))

})
.catch(err => {
  abort(`Caught error: ${err.toString()}`)
})


function createConfig(options) {
  return `/*
 * config.js
 *
 * This is the configuration file for your profyle node.
 */

const path = require('path')

module.exports = {
  paths: {
    input:    ${JSON.stringify(options.input)},
    data:     path.join(__dirname, 'data'),
    database: path.join(__dirname, 'data', 'app.db'),
  },

  isCentral: ${JSON.stringify(options.isCentral)}, /* if this is a central server */
  isNode:    ${JSON.stringify(options.isNode)}, /* if this is a node server */

  ${
  options.isCentral ?
  `/* Central Server options */
  twilio: {
    account: ${JSON.stringify(options.twilio.account)},
    token:   ${JSON.stringify(options.twilio.token)},
    from:    ${JSON.stringify(options.twilio.phone)},
  },

` : ''
  }${
  options.isNode ?
  `/* Node Server options */
  apiKey: ${JSON.stringify(options.apiKey)},`
  : ''
  }
}`
}

function abort(message) {
  console.error(chalk.red.bold(message))
  process.exit(1)
}
