/*
 * IGVBrowser.js
 * MIT License (c) romgrk 2018
 */
/* global igv */
/*

  Must be imported manually:

  <!-- IGV.js -->
  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/themes/smoothness/jquery-ui.css"/>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"/>
  <link rel="stylesheet" href="https://igv.org/web/release/1.0.9/igv-1.0.9.css">
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
  <script type="text/javascript" src="https://igv.org/web/release/1.0.9/igv-1.0.9.js"></script>
  <!--/ IGV.js -->

  Usage:

    <IGVBrowser
      reference={{ id: 'hg19' }}
      locus='chr8:128,747,267-128,754,546'
      trackDefaults={{ alignment: { height: 150 } }}
      tracks={
        selectedEntries
          .filter(([file, selected]) => selected)
          .map(([file, _]) => ({
            name: (file.match(/[^/]+$/) || [file])[0],
            url: `/files/${file}`
          }))
      }
      showGenes={true}
    />

 */


import React from 'react';
import propTypes from 'prop-types';


const TrackTypes = propTypes.oneOf([
  'annotation', 'wig', 'alignment', 'variant', 'seg'
])
const SourceTypes = propTypes.oneOf([
  'file', 'gcs', 'ga4gh'
])

const TrackBase = {
  type:             TrackTypes, // Track type                                                                                                                            	 No default. If not specified, type is inferred from file format
  sourceType:       SourceTypes, // Type of data source. Valid values are "file", "gcs" for Google Cloud Storage, and "ga4gh" for the Global Alliance API                 	 "file"
  format:           propTypes.string, // File format                                                                                                                           	 No default. If not specified format is inferred from file name extension
  indexURL:         propTypes.string, // URL to a file index, such as a BAM .bai, Tabix .tbi, or Tribble .idx file.
  indexed:          propTypes.bool, // Flag used to indicate if a file is indexed or not. If indexURL is provided this flag is redundant. If the indexURL is not provided and this flag is true index files will be searched by file name convention. NOTE: This is a change from previous igv releases.
  order:            propTypes.number, // Integer value specifying relative order of track position on the screen. To pin a track to the bottom use Number.MAX_VALUE. If no order is specified, tracks appear in order of their addition.
  color:            propTypes.string, // CSS color value for track features, e.g. "#ff0000" or "rgb(100,0,100)"
  height:           propTypes.number, // Initial height of track viewport in pixels                                                                                            	 50
  autoHeight:       propTypes.bool, // If true, then track height is adjusted dynamically, within the bounds set by minHeight and maxHeight, to accomdodate features in view 	 true
  minHeight:        propTypes.number, // Minimum height of track in pixels                                                                                                     	 50
  maxHeight:        propTypes.number, // Maximum height of track in pixels                                                                                                     	 500
  visibilityWindow: propTypes.number, // Maximum window size in base pairs for which indexed annotations or variants are displayed                                             	 1 MB for variants, 30 KB for alignments, whole chromosome for other track types
  /* TODO per-type options */
}

const Track = propTypes.shape({
  ...TrackBase,
  name:             propTypes.string.isRequired, // Display name (label). Required
  url:              propTypes.string.isRequired, // URL to the track data resource, such as a file or webservice. Required
})

const TrackDefault = propTypes.shape({
  ...TrackBase
})

const TrackDefaults = propTypes.shape({
  annotation: TrackDefault,
  wig: TrackDefault,
  alignment: TrackDefault,
  variant: TrackDefault,
  seg: TrackDefault,
})

const BrowserOptions = {
  minimumBases:     propTypes.string, // Zoom-in is clamped to this value.	40
  reference:        propTypes.object.isRequired, // Object defining reference sequence. See object details below.
  showKaryo:        propTypes.bool, // If true, show a whole-genome karyotype view.	false
  showNavigation:   propTypes.bool, // If true, show basic navigation controls (search, zoom in, zoom out).	true
  showRuler:        propTypes.bool, // If true, show a genomic ruler track.	true
  tracks:           propTypes.arrayOf(Track).isRequired, // Array of configuration objects defining tracks initially displayed when app launches.
  trackDefaults:    TrackDefaults, // Embedded object defining default settings for specific track types (see table below).
  locus:            propTypes.string, // Initial genomic location
  flanking:         propTypes.number, // Distance (in bp) to pad sides of gene when navigating.	1000
  palette:          propTypes.arrayOf(propTypes.string), // Array of colors for the track color picker's default palette (e.g. ["#00A0B0", "#6A4A3C", "#CC333F", "#EB6841"])
  search:           propTypes.object, // Object defining a web service for supporting search by gene or other annotation. See object details below. Optional
  apiKey:           propTypes.string, // Google API key. Optional
  doubleClickDelay: propTypes.number, // Maximum between mouse clicks in milliseconds to trigger a double-click	500
}


const genesTrack = {
  name: 'Genes',
  type: 'annotation',
  format: 'bed',
  sourceType: 'file',
  url: 'https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/refGene.hg19.bed.gz',
  indexURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/refGene.hg19.bed.gz.tbi',
  order: Number.MAX_VALUE,
  visibilityWindow: 300000000,
  displayMode: 'EXPANDED',
  height: 80,
}

export default class IGVBrowser extends React.Component {
  static propTypes = {
    ...BrowserOptions,
    showGenes: propTypes.bool,
  }

  componentDidMount() {
    // IGV.js code is impure, therefore we need to make a copy of everything we pass to it
    this.browser = igv.createBrowser(this.element, { ...this.props, tracks: getTracks(this.props) })
  }

  componentWillReceiveProps(props) {
    const previousTracksList = getTracks(this.props)
    const nextTracksList = getTracks(props)

    if (!tracksEqual(previousTracksList, nextTracksList)) {

      const previousTracks = new Set()
      const nextTracks = new Set()

      previousTracksList.forEach(track => previousTracks.add(getTrackID(track)))
      nextTracksList.forEach(track => nextTracks.add(getTrackID(track)))

      /*
       * Here, we access igv.Browser internals because the Browser#removeTrackByName
       * function is not in the 1.9 release, but it should be used when available
       */
      const tracksToRemove = this.browser.trackViews
        .filter(view => view.track.id !== 'ruler' && view.track.id !== 'sequence' && !nextTracks.has(getTrackID(view.track)))
        .map(view => view.track)
      const tracksToAdd = nextTracksList.filter(track => !previousTracks.has(getTrackID(track)))

      tracksToRemove.forEach(track => this.browser.removeTrack(track))
      tracksToAdd.forEach(track => this.browser.loadTrack(track))
    }

    if (this.props.locus !== props.locus) {
      this.browser.search(props.locus)
    }
  }

  render() {
    return (
      <div className='IGVBrowser' ref={e => e && (this.element = e)} />
    )
  }
}

function getTracks(props) {
  return props.showGenes ? props.tracks.concat(genesTrack) : props.tracks
}

function tracksEqual(previous, next) {
  const previousTracks = previous.filter(track => track.type !== 'sequence')
  const nextTracks = next.filter(track => track.type !== 'sequence')

  if (previousTracks.length !== nextTracks.length)
    return false

  for (let i = 0; i < previousTracks.length; i++) {
    if (getTrackID(previousTracks[i]) !== getTrackID(nextTracks[i]))
      return false
  }

  return true
}

function getTrackID(track) {
  return `${track.name}_${track.url}`
}
