/*
 * parse-profyle-csv.js
 */
/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const CSV = require('csv-string')
const rimraf = require('rimraf')

const args = process.argv.slice(2)
const input  = args[0]
const output = args[1]

if (!input || !output) {
  console.error('Missing arguments')
  process.exit(1)
}

const HEADERS = [
  'id',
  'regional_profiling_center',
  'disease',
  'tumor_type',
  'tumor_content',
  'normal_source',
  'biopsy_date',
  'tissue_type',
  'biopsy_type',
  'enrollment_date_and_initials',
  'sample_shipment_date',
  'dna_library_construction_method',
  'wgs_seq_completion_date',
  'rna_library_construction_method',
  'rna_seq_completion_date',
  'panel_completion_date',
  'other_analysis_descriptor_and_completion_date',
  'date_of_updload_to_sftp',
  'tumor_board_predentation_date_and_analysises',
  'comments'
]


const text = fs.readFileSync(input).toString()

const records = parseCSV(text)

console.log(records.length + ' records')

createCleanDirectory(output)
createStructure(output, records)


function parseCSV(text) {
  const lines = CSV.parse(text).slice(1)
  const records = linesToRecords(lines)
  return records
}

function linesToRecords(lines) {
  const records = []
  lines.forEach(line => {
    const record = {}
    line.forEach((value, index) =>
      record[HEADERS[index]] = value
    )
    records.push(record)
  })
  return records
}

function createCleanDirectory(path) {
  rimraf.sync(path)
  fs.mkdirSync(path)
}

function createStructure(output, records) {
  records.forEach(record => {
    const donor = recordToDonor(record)
    const sampleID = `${record.id}_N1`
    const experiment = recordToExperiment(record)

    const base = path.join(output, record.id)
    const experimentFilename = `${sampleID}.${experiment.experiment_type}.json`

    fs.mkdirSync(base)
    fs.writeFileSync(path.join(base, `${record.id}.json`), JSON.stringify(donor))
    fs.mkdirSync(path.join(base, sampleID))
    fs.mkdirSync(path.join(base, sampleID, experiment.experiment_type))
    fs.writeFileSync(path.join(base, sampleID, experiment.experiment_type, experimentFilename), JSON.stringify(experiment))
  })
}

function recordToDonor(record) {
  return {
    profyle_national_id: record.id, // "PRO-00019W",
    profyle_regional_id: null, // "TCMG66",
    internal_id: null,
    age: null, // 15,
    sex: null, // "Male",
    ethnicity : null,
    disease: record.disease, // "Ewing sarcoma",
    disease_ontology_uri: null, // "http://codes.iarc.fr/code/3784",
    recruitement_team: {
      group_name: null, // "Sharon Abish",
      hospital: record.regional_profiling_center, // "Montreal General Hospital",
      province: null, // "Quebec"
    },

    sample: {

      [`${record.id}_N1`]: {
        tissue_type: record.tissue_type, // "blood plasma",
        tissue_type_ontology_uri: null, // "http://purl.obolibrary.org/obo/UBERON_0001969",
        tumor: null, //"no",
        sample_submission_date: null, // "2017-03-01",
        storage_location: [], // ["Jabado", "Sinnett"],
        remarks: record.comments, // ""
      },
    }
  }
}

function recordToExperiment(record) {
  return {
    sample_id: `${record.id}_N1`, // "PRO-00019W_N1",
    assay_type: null, // "DNA-seq",
    experiment_type: 'wgs', // "Whole genome",
    protocol_type: null, // "PCR free",
    sequencing_center: null, // "McGill",

    raw_data: [], /*[
      {
        filename: "PRO-00019W_N1_WGS_Blood.4137.1.pair2.fastq.gz",
        md5sum: "13136a8055bace6d564ca76c8768c64a"
      }
    ]*/
  }
}
