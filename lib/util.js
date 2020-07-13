'use strict'

const assert = require('assert')
const { kDestroyed } = require('./symbols')

function nop () {}

function isStream (body) {
  return body && typeof body.on === 'function'
}

function bodyLength (body, doRead) {
  if (body && typeof body.on === 'function') {
    if (doRead && typeof body.read === 'function') {
      body.read(0)
    }
    const state = body._readableState
    return state && state.ended ? state.length : undefined
  }

  assert(!body || Number.isFinite(body.byteLength))

  return body ? body.byteLength : 0
}

function destroy (stream, err) {
  if (!stream) {
    return stream
  }

  assert(typeof stream.on === 'function')

  if (stream.destroyed || stream[kDestroyed]) {
    return stream
  }

  if (typeof stream.destroy === 'function') {
    stream.destroy(err)
  } else if (err) {
    process.nextTick((stream, err) => {
      stream.emit('error', err)
    }, stream, err)
  }

  if (stream.destroyed !== true) {
    stream[kDestroyed] = true
  }

  return stream
}

module.exports = {
  nop,
  isStream,
  destroy,
  bodyLength
}