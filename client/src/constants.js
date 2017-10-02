/*
 * constants.js
 */


export const selectionColor = 'rgba(89, 158, 255, 0.14)'


export const DONOR_COLUMNS = [
    { field: 'id',                         title: 'Donor' }
  , { field: 'age',                        title: 'Age' }
  , { field: 'sex',                        title: 'Sex' }
  , { field: 'recruitement_team.hospital', title: 'Hospital' }
  , { field: 'recruitement_team.province', title: 'Province' }
]

export const SAMPLE_COLUMNS = [
    { field: 'id',                       title: 'Sample' }
  , { field: 'tissue_type',              title: 'Tissue Type' }
  , { field: 'tissue_type_ontology_uri', title: 'Ontology', type: 'link' }
  , { field: 'tumor',                    title: 'Tumor?' }
  , { field: 'sample_submission_date',   title: 'Submission Date' }
  , { field: 'storage_location',         title: 'Storage Location' }
  , { field: 'remarks',                  title: 'Remarks' }
]
