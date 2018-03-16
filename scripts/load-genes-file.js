/*
 * load-genes-file.js
 */
/* eslint-disable no-console */


const fs = require('fs')
const CSV = require('csv-string')
const chalk = require('chalk')
const db = require('../database')


module.exports = loadGenesFile


if (require.main === module) {

  const args = process.argv.slice(2)
  const input  = args[0]

  if (!input) {
    console.error('Missing input file')
    process.exit(1)
  }

  console.log(chalk.bold(`Loading ${input}...`))

  loadGenesFile(input)
  .then(rowsInserted => {
    console.log(chalk.green.bold(`Finished loading genes. Inserted ${rowsInserted} rows`))
  })
  .catch(err => {
    console.error(chalk.red.bold(`Error while loading genes file: ${err.message}`))
    process.exit(1)
  })
}



/*
 * Bed format:
 * chrom  start  end  name
 * 0      1      2    3
 */


function loadGenesFile(input) {
  const text = fs.readFileSync(input).toString()
  const records = CSV.parse(text, '\t')

  const recordsByID = {}
  records.forEach(record => {
    recordsByID[record.slice(0, 4).join(':')] = record
  })

  return db.run('DROP TABLE IF EXISTS genes')
  .then(() =>
    db.run(`CREATE TABLE genes (
      chrom text not null,
      start text not null,
      end   text not null,
      name  text not null
    )`)
  )
  .then(() =>
    Promise.all(Object.values(recordsByID).map(record =>
      db.run('INSERT INTO genes VALUES (@chrom, @start, @end, @name)', {
        chrom: record[0],
        start: record[1],
        end:   record[2],
        name:  record[3],
      })
    ))
  )
  .then(() => records.length)
}
