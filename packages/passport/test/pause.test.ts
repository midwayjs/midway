import { pause } from '../src/passport/pause';
import { Stream } from 'stream';
import * as assert from 'assert';

const after = require('after')

describe('pause(stream)', function () {
  it('should return a handle', function () {
    const stream = new Stream()
    const handle = pause(stream)
    assert.ok(handle && typeof handle === 'object')
  })

  describe('handle.end()', function () {
    it('should stop collecting events', function (done) {
      const cb = after(1, done)
      const stream = new Stream()
      const handle = pause(stream)

      stream.emit('data', 'ping')

      process.nextTick(function () {
        handle.end()

        stream.emit('data', 'pong')
        stream.emit('end')

        process.nextTick(function () {
          const expected = [
            ['data', 'ping']
          ]

          stream.on('data', function (data) {
            assert.deepEqual(['data', data], expected.shift())
            cb()
          })

          stream.on('end', function () {
            assert.deepEqual(['end'], expected.shift())
            cb()
          })

          handle.resume()
        })
      })
    })
  })

  describe('handle.pause()', function () {
    it('should re-emit data events', function (done) {
      const cb = after(2, done)
      const stream = new Stream()
      const handle = pause(stream)

      stream.emit('data', 'ping')
      stream.emit('data', 'pong', 'utf8')

      process.nextTick(function () {
        const expected = [
          ['ping', undefined],
          ['pong', 'utf8']
        ]

        stream.on('data', function (data, encoding) {
          assert.deepEqual([data, encoding], expected.shift())
          cb()
        })

        handle.resume()
      })
    })

    it('should re-emit end event', function (done) {
      const cb = after(1, done)
      const stream = new Stream()
      const handle = pause(stream)

      stream.emit('end')

      process.nextTick(function () {
        stream.on('end', cb)

        handle.resume()
      })
    })

    it('should re-emit events in original order', function (done) {
      const cb = after(3, done)
      const stream = new Stream()
      const handle = pause(stream)

      stream.emit('data', 'ping')
      stream.emit('data', 'pong')
      stream.emit('end')

      process.nextTick(function () {
        const expected = [
          ['data', 'ping'],
          ['data', 'pong'],
          ['end']
        ]

        stream.on('data', function (data) {
          assert.deepEqual(['data', data], expected.shift())
          cb()
        })

        stream.on('end', function () {
          assert.deepEqual(['end'], expected.shift())
          cb()
        })

        handle.resume()
      })
    })
  })
})
