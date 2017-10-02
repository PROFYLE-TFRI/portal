/*
 * constants.js
 */


export const SELECTION_COLOR = 'rgba(89, 158, 255, 0.14)'
export const OPAQUE_SELECTION_COLOR = 'rgba(89, 158, 255, 1)'

export const COLORS = [ '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360' ]

export const DONOR_COLUMNS = [
    { field: 'id',                         title: 'Donor' }
  , { field: 'age',                        title: 'Age' }
  , { field: 'sex',                        title: 'Sex' }
  , { field: 'disease',                    title: 'Disease', uri: 'disease_ontology_uri' }
  , { field: 'recruitement_team.hospital', title: 'Hospital' }
  , { field: 'recruitement_team.province', title: 'Province' }
]

export const SAMPLE_COLUMNS = [
    { field: 'id',                       title: 'Sample' }
  , { field: 'tissue_type',              title: 'Tissue Type', uri: 'tissue_type_ontology_uri' }
  , { field: 'tumor',                    title: 'Tumor?' }
  , { field: 'sample_submission_date',   title: 'Submission Date' }
  , { field: 'storage_location',         title: 'Storage Location' }
  , { field: 'remarks',                  title: 'Remarks' }
]

export const EXPERIMENT_COLUMNS = [
    { field: 'id',                title: 'Experiment' }
  , { field: 'assay_type',        title: 'Assay Type' }
  , { field: 'experiment_type',   title: 'Experiment Type' }
  , { field: 'protocol_type',     title: 'Protocol Type' }
  , { field: 'sample_id',         title: 'Sample ID' }
  , { field: 'sequencing_center', title: 'Sequencing Center' }
]