/*
 * gemini.js
 */

const child_process = require('child_process')
const csvParse = require('csv-parse/lib/sync')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: Number.MAX_SAFE_INTEGER }, (err, stdout, stderr) =>
      err ? reject(err) : resolve({ stdout, stderr })))

module.exports = {
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
   ${ ref !== undefined ?
    [ escape`AND ref = ${ref}` ] : ''
   }
   ${ alt !== undefined ?
    [ escape`AND alt = ${alt}` ] : ''
   }
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
    if (i < args.length)
      result += escapeValue(args[i])
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
      throw new Error(`Unrecognized value: ${value}`)
  }
}

