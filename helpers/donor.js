/*
 * donor.js
 */


module.exports = {
  forEachDonor,
  forEachSample,
  forEachExperiment,
}

function forEachDonor(donors, fn) {
  let i = 0
  for (let key in donors) {
    const donor = donors[key]
    fn(donor, i++)
  }
}

function forEachSample(donors, fn) {
  let i = 0
  for (let donorID in donors) {
    const donor = donors[donorID]
    for (let sampleID in donor.samples) {
      const sample = donor.samples[sampleID]
      fn(sample, donor, i++)
    }
  }
}

function forEachExperiment(donors, fn) {
  let i = 0
  for (let donorID in donors) {
    const donor = donors[donorID]
    for (let sampleID in donor.samples) {
      const sample = donor.samples[sampleID]
      for (let experimentID in sample.experiments) {
        const experiment = sample.experiments[experimentID]
        fn(experiment, sample, donor, i++)
      }
    }
  }
}
