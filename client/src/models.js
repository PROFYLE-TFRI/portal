/*
 * models.js
 */

import { prop } from 'ramda';
const { keys, values } = Object


export function computeValues(state) {
  const donors = values(state.donors)

  // Impure but it's ok since there's no ref to state yet
  state.values = {
    donors: keys(state.donors),
    provinces: donors.map(prop('recruitement_team.province')),
    hospitals: donors.map(prop('recruitement_team.hospital')),
    diseases: donors.map(prop('disease'))
  }

  return state
}

