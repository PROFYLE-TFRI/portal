/*
 * gemini.js
 */

const fs = require('fs')
const util = require('util')
const child_process = require('child_process')
const exists = util.promisify(fs.exists)
const rename = util.promisify(fs.rename)

const csvParse = require('csv-parse/lib/sync')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: Number.MAX_SAFE_INTEGER }, (err, stdout, stderr) =>
      err ? reject(new Error(JSON.stringify(err.cmd) + ': ' + (stderr || stdout))) : resolve({ stdout, stderr })))

module.exports = {
  load,
  getVariantsAt,
  getDistinctChroms,
  getStartLike,
  escape,
}

function getVariantsAt(path, { chrom, start, end = start + 1, ref, alt }) {
  const params = '--header --show-samples --format sampledetail'

  const query = escape`
    SELECT chrom, start, end, ref, alt, (gts).(*)
      FROM variants
     WHERE chrom = ${chrom}
       AND start >= ${start}
       AND end   <= ${end}
   ${[ ref ?
      escape`AND ref = ${ref}` : ''
   ]}
   ${[ alt ?
      escape`AND alt = ${alt}` : ''
   ]}
  `

  return geminiQuery(path, query, params).then(res =>
    normalizeSamples(parseCSV(res.stdout))
  )
}

function getDistinctChroms(path) {
  return geminiQuery(path, 'SELECT DISTINCT(chrom) FROM variants')
    .then(parseLines)
}

function getStartLike(path, chrom, start, limit = 15) {
  return geminiQuery(path, escape`
    SELECT DISTINCT(start)
      FROM variants
     WHERE chrom = ${chrom}
       AND start LIKE ${'' + (start || '') + '%'}
     LIMIT ${limit}
  `)
  .then(parseLines)
}


function load(vcfFile, outputFile) {
  const tmpFile = `${outputFile}.part`
  const command = `gemini load -v '${vcfFile}' '${tmpFile}'`

  return exists(tmpFile)
    .then(fileExists =>
      fileExists ?
        Promise.reject(new Error('gemini.load: tmpFile already exists')) :
        exec(command)
          .then(() => rename(tmpFile, outputFile))
    )
}

function geminiQuery(path, query, params = '') {
  const command =
    `gemini query ${path} \
        ${params} \
        -q "${query.replace(/"/g, '\\"')}"`

  return exec(command)
}


function normalizeSamples(samples) {
  samples.forEach(sample => {

    sample.value = sample['gts.' + sample.name]

    for (let key in sample) {
      if (key.startsWith('gts.'))
        delete sample[key]
    }
  })
  return samples
}

function parseLines({ stdout }) {
  return stdout.split('\n').filter(Boolean)
}

function parseCSV(string) {
  return csvParse(string, { delimiter: '\t', columns: true })
}

function escape(strings, ...args) {
  let result = ''
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]
    if (i < args.length) {
      const value = escapeValue(args[i])
      if (value === undefined)
        throw new Error(`Unrecognized value: ${value}, at index ${i} of ${JSON.stringify(args)}`)
      result += value
    }
  }
  return result
}

function escapeValue(value) {
  if (Array.isArray(value))
    return value.join('')
  if (value === null)
    return 'NULL'
  switch (typeof value) {
    case 'number':
      return value
    case 'string':
      return '\'' + value.replace(/'/g, '\'\'') + '\''
    case 'object':
      return '\'' + ('' + value).replace(/'/g, '\'\'') + '\''
    default:
      return undefined
  }
}

