/*
 * donor.js
 */

const path = require('path')
const { indexBy, prop } = require('ramda')
const { exists, readDir, readJSON } = require('../helpers/filesystem')
const { forEachExperiment } = require('../helpers/donor')
const { getVariantsAt, getDistinctChroms } = require('../helpers/gemini')
const { separateWarnings } = require('../helpers/handlers')
const config = require('../config')

module.exports = {
  findByID,
  findAll,
  listChroms,
  searchVariants,
}

function findByID(id) {
  return getDonor(id)
}

function findAll() {
  return readDir('.')
    .then(ids => Promise.all(ids.map(getDonor)))
    .then(donors => donors.filter(d => !d.invalid))
    .then(indexBy(prop('id')))
}

function listChroms() {
  return findAll()
  .then(donors => {
    const results = []
    forEachExperiment(donors, (experiment, sample, donor) => {
      experiment.variants.forEach(file => {
        results.push(
          getDistinctChroms(path.join(config.paths.input, file))
          .catch(err => {
            return Promise.resolve(err)
          })
        )
      })
    })
    return Promise.all(results)
  })
  .then(separateWarnings)
  .then(([results, warnings]) => [Array.from(results.reduce((acc, cur) => new Set([...acc, ...cur]), [])), warnings])
}

function searchVariants(params) {
  return findAll()
  .then(donors => {
    const results = []
    forEachExperiment(donors, (experiment, sample, donor) => {
      experiment.variants.forEach(file => {
        results.push(

          getVariantsAt(path.join(config.paths.input, file), params)
          .then(variants => ({
            experimentID: experiment.id,
            sampleID: sample.id,
            donorID: donor.id,
            file,
            variants
          }))
          .catch(err => {
            return Promise.resolve(err)
          })

        )
      })
    })
    return Promise.all(results)
  })
  .then(separateWarnings)
  .then(([results, warnings]) => [results.filter(r => r.variants.length > 0), warnings])
}

// Helpers

function getDonor(id) {
  return readJSON(getDonorJSONPath(id))
    .then(data => normalizeDonor(id, data))
    .then(donor => {
      return attachExperiments(donor)
        .catch(err => {
          donor.invalid = true
          donor.message = err
          return Promise.resolve(donor)
        })
    })
    .catch(err => {
      return Promise.resolve({
        id: id,
        invalid: true,
        message: err
      })
    })
}


function attachExperiments(donor) {
  return Promise.all(Object.keys(donor.samples).map(sampleID => {

    return readDir(getSamplePath(donor.id, sampleID))
    .then(exprimentTypes =>
      Promise.all(exprimentTypes.map(experimentType =>

        Promise.all(
          [
            readJSON(getExperimentJSONPath(donor.id, sampleID, experimentType)),
            readJSON(getExperimentAnalysisJSONPath(donor.id, sampleID, experimentType))
              .catch(err => Promise.resolve(null))
          ]
        )
        .then(([experiment, analysis]) => normalizeExperiment(experimentType, sampleID, experiment, analysis))
        .then(experiment =>
          Promise.all([
            getAlignmentFiles(donor.id, sampleID, experiment),
            getVariantFiles(donor.id, sampleID, experiment),
          ])
          .then(([alignments, variants]) => {
            experiment.alignments = alignments
            experiment.variants = variants
            return experiment
          })
        )
        .catch(err => {
          // ignore bad experiments for now TODO(warnings)
          return Promise.resolve(undefined)
        })
      ))
      .then(experiments => experiments.filter(Boolean))
      .then(indexBy(prop('id')))
      .then(experimentsByID => donor.samples[sampleID].experiments = experimentsByID)
    )

  }))
  .then(() => donor)
}

function getAlignmentFiles(id, sampleID, experiment) {
  const experimentPath = getExperimentPath(id, sampleID, experiment.type)

  return (experiment.alignments || [])
    .map(alignment => path.join(experimentPath, alignment.filename))
    .filter(file => /\.bam$/.test(file))
}

function getVariantFiles(id, sampleID, experiment) {
  const experimentPath = getExperimentPath(id, sampleID, experiment.type)

  return (experiment.snv_panel || [])
    .map(details => path.join(experimentPath, details.filename))
    .filter(file => /\.db$/.test(file))
}

function normalizeDonor(id, data) {
  data.id = id

  // Flattern data
  Object.keys(data.recruitement_team)
  .forEach(key => {
    data[`recruitement_team.${key}`] = data.recruitement_team[key]
  })
  delete data.recruitement_team

  // data.sample => data.samples
  data.samples = data.sample
  delete data.sample

  // Normalize samples
  Object.keys(data.samples)
    .forEach(sampleID =>
      normalizeSample(sampleID, id, data.samples[sampleID]))

  return data
}

function normalizeSample(id, donorID, data) {
  data.id = id
  data.donorID = donorID
  return data
}

function normalizeExperiment(type, sampleID, data, analysis) {
  data.id = `${sampleID}.${type}`
  data.analysis = analysis
  data.type = type
  return data
}

function getDonorJSONPath(id) {
  return `${id}/${id}.json`
}

function getSamplePath(id, sampleID) {
  return `${id}/${sampleID}`
}

function getExperimentPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}`
}

function getExperimentJSONPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/${sampleID}.${experimentType}.json`
}

function getExperimentVariantsPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/variants`
}

function getExperimentAnalysisJSONPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/analysis.json`
}

function readDirIfExists(path) {
  return exists(path)
  .then(doExists =>
    (doExists ?
        readDir(path)
      : Promise.resolve([]))
  )
}
