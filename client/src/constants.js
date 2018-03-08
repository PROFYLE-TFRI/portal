/*
 * constants.js
 */


export const SELECTION_COLOR = 'rgba(89, 158, 255, 0.14)'
export const OPAQUE_SELECTION_COLOR = 'rgba(89, 158, 255, 1)'

// Thanks to Google Charts
export const COLORS = [
    '#3366CC'
  , '#DC3912'
  , '#FF9900'
  , '#109618'
  , '#990099'
  , '#3B3EAC'
  , '#0099C6'
  , '#DD4477'
  , '#66AA00'
  , '#B82E2E'
  , '#316395'
  , '#994499'
  , '#22AA99'
  , '#AAAA11'
  , '#6633CC'
  , '#E67300'
  , '#8B0707'
  , '#329262'
  , '#5574A6'
  , '#3B3EAC'
]


export const DONOR_COLUMNS = [
    { field: 'id',                         title: 'Donor', isKey: true }
  , { field: 'age',                        title: 'Age' }
  , { field: 'sex',                        title: 'Sex' }
  , { field: 'disease',                    title: 'Disease', uri: 'disease_ontology_uri', showTitle: false }
  , { field: 'recruitement_team.hospital', title: 'Hospital' }
  , { field: 'recruitement_team.province', title: 'Province' }
]

export const SAMPLE_COLUMNS = [
    { field: 'id',                       title: 'Sample', isKey: true }
  , { field: 'tissue_type',              title: 'Tissue Type', uri: 'tissue_type_ontology_uri', showTitle: false }
  , { field: 'tumor',                    title: 'Tumor?' }
  , { field: 'sample_submission_date',   title: 'Submission Date' }
  , { field: 'storage_location',         title: 'Storage Location' }
  , { field: 'remarks',                  title: 'Remarks' }
]

export const EXPERIMENT_COLUMNS = [
    { field: 'id',                title: 'Experiment', isKey: true }
  , { field: 'assay_type',        title: 'Assay Type' }
  , { field: 'experiment_type',   title: 'Type' }
  , { field: 'protocol_type',     title: 'Protocol' }
  , { field: 'sequencing_center', title: 'Seq. Center' }
]


export const TABS = {
  PORTAL:   'PORTAL',
  USERS:    'USER',
  SETTINGS: 'SETTINGS',
}


export const ENTITIES = {
  DISEASES:  'diseases',
  PROVINCES: 'provinces',
  DONORS:    'donors',
  SAMPLES:   'samples',
}
