/*
 * peer.js
 */


export function createNew() {
  return {
    id:       '',
    url:      '',
    apiKey:   '',
    isActive: '',
  }
}

export function deserialize(peer) {
  return {
    id:       peer.id,
    url:      peer.url,
    apiKey:   peer.apiKey,
    isActive: peer.isActive,
  }
}

export function serialize(peer) {
  return {
    id:       peer.id,
    url:      peer.url,
    apiKey:   peer.apiKey,
    isActive: peer.isActive,
  }
}
