/*
 * donor.js
 */

const path = require('path')
const { indexBy, prop } = require('ramda')
const { exists, readDir, readJSON } = require('../helpers/filesystem')


exports.findByID = (id) =>
  getDonor(id)

exports.findAll = () =>
  readDir('.')
    .then(ids => Promise.all(ids.map(getDonor)))
    .then(indexBy(prop('id')))



function getDonor(id) {
  return readJSON(getDonorJSONPath(id))
    .then(data => normalizeDonor(id, data))
    .then(attachExperiments)
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
        .then(experiment => attachAlignments(donor.id, sampleID, experiment))
      ))
      .then(indexBy(prop('id')))
      .then(experimentsByID => donor.samples[sampleID].experiments = experimentsByID)
    )

  }))
  .then(() => donor)
}

function attachAlignments(id, sampleID, experiment) {
  const alignments = getExperimentAlignmentsPath(id, sampleID, experiment.type)

  return exists(alignments)
  .then(doExists =>
    (doExists ?
        readDir(alignments)
      : Promise.resolve([]))
    .then(files => {
      experiment.alignments = files
        .filter(file => /\.bam$/.test(file))
        .map(file => path.join(alignments, file))
      return experiment
    })
  )
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

function getExperimentJSONPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/${sampleID}.${experimentType}.json`
}

function getExperimentAlignmentsPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/alignments`
}

function getExperimentAnalysisJSONPath(id, sampleID, experimentType) {
  return `${id}/${sampleID}/${experimentType}/analysis.json`
}
