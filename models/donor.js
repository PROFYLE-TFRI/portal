/*
 * donor.js
 */

const { join } = require('path')
const { indexBy, prop } = require('ramda')
const { readDir, readFile, readJSON } = require('../helpers/filesystem')
const config = require('../config')


exports.find = (id) =>
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
    .then(experimentsID =>
      Promise.all(experimentsID.map(experimentID =>

        readJSON(
          getExperimentJSONPath(donor.id, sampleID, experimentID)
        )
        .then(experiment => normalizeExperiment(experimentID, sampleID, experiment))

      ))
      .then(indexBy(prop('id')))
      .then(experimentsByID => donor.samples[sampleID].experiments = experimentsByID)
    )

  }))
  .then(() => donor)
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

function normalizeExperiment(id, sampleID, data) {
  data.id = `${sampleID}.${id}`
  data.name = id
  return data
}

function getDonorJSONPath(id) {
  return `${id}/${id}.json`
}

function getSamplePath(id, sampleID) {
  return `${id}/${sampleID}`
}

function getExperimentJSONPath(id, sampleID, experimentID) {
  return `${id}/${sampleID}/${experimentID}/${sampleID}.${experimentID}.json`
}
