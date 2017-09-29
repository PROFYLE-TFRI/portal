/*
 * models.js
 */

const { values } = Object


export function createDefaultUI() {
  return {
    selection: {
      donors: new Set()
    }
  }
}
export function createDefaultData() {
  return {
      isLoading: false
    , donors: {}
  }
}


export function normalizeDonors(donors) {
  values(donors).forEach(donor => {
    donor.selected = false
  })
}
