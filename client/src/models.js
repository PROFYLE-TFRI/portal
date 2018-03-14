/*
 * models.js
 */

import { prop } from './helpers/rambda';


export function computeValues(state) {
  const donors = Object.values(state.donors)

  // Impure but it's ok since there's no ref to state yet
  state.values = {
    donors: Object.keys(state.donors),
    provinces: donors.map(prop('recruitement_team.province')),
    hospitals: donors.map(prop('recruitement_team.hospital')),
    diseases: donors.map(prop('disease'))
  }

  return state
}

