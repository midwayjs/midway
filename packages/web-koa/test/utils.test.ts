import { sendToWormhole } from '../src/utils';
import * as fs from 'fs';
import { Writable } from 'stream';
import * as assert from 'assert';
import { join } from 'path';

describe('test/index.test.js', () => {
  let bigtext = join(__dirname, 'big.txt');

  beforeAll(() => {
    for ( let i = 0; i< 1000; i++) {
      fs.appendFileSync(bigtext, 'console.log("hello")');
    }
  });

  afterAll(() => {
    fs.unlinkSync(bigtext);
  })

  it('should work with read stream', () => {
    const stream = fs.createReadStream(bigtext);
    return sendToWormhole(stream);
  });

  it('should call multi times work', () => {
    const stream = fs.createReadStream(bigtext);
    return sendToWormhole(stream).then(() => {
      return sendToWormhole(stream).then(() => {
        return sendToWormhole(stream);
      });
    });
  });

  it('should work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(/* chunk, encoding, callback */) {
        console.log('PauseStream1 write buffer size: %d', arguments[0].length);
        writeSize += arguments[0].length;
        // do nothing
      }
    }

    const stream = fs.createReadStream(bigtext);
    stream.pipe(new PauseStream());
    // mock delay
    setTimeout(() => {
      assert.ok(writeSize > 0);
      sendToWormhole(stream).then(done);
    }, 100);
  });

  it.skip('should work with read stream after listening readable', async () => {
    const stream = fs.createReadStream(bigtext);
    let data;
    stream.on('readable', () => {
      if (!data) {
        data = stream.read();
        console.log('read data %d', data && data.length);
      }
    });
    await sendToWormhole(stream).then(() => {
      assert.ok(!data);
    });
  });

  it('should work with read stream after readable emitted', done => {
    const stream = fs.createReadStream(bigtext);
    let data;
    stream.on('readable', () => {
      if (!data) {
        data = stream.read();
        console.log('read data %d', data && data.length);
      }
    });
    setTimeout(() => {
      sendToWormhole(stream).then(() => {
        assert.ok(data);
        done();
      });
    }, 500);
  });

  it('should call multi times work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(/* chunk, encoding, callback */) {
        console.log('PauseStream2 write buffer size: %d', arguments[0].length);
        writeSize += arguments[0].length;
        // do nothing
      }
    }

    const stream = fs.createReadStream(bigtext);
    stream.pipe(new PauseStream());
    // mock delay
    setTimeout(() => {
      assert.ok(writeSize > 0);
      sendToWormhole(stream).then(() => {
        sendToWormhole(stream).then(() => {
          sendToWormhole(stream).then(done);
        });
      });
    }, 100);
  });

  it('should not throw error by default when stream error', () => {
    const stream = fs.createReadStream(bigtext + '-not-exists');
    return sendToWormhole(stream);
  });

  it('should pass ended', done => {
    const stream = fs.createReadStream(bigtext);
    stream.resume();
    stream.on('end', () => {
      sendToWormhole(stream).then(done);
    });
  });

  it('should mock destroyed', () => {
    const stream = {
      destroyed: true,
      resume() {},
    };
    return sendToWormhole(stream);
  });

  it('should mock fake read stream', () => {
    const stream = {};
    return sendToWormhole(stream);
  });

  it('should mock readable = false', () => {
    const stream = {
      readable: false,
      resume() {},
    };
    return sendToWormhole(stream);
  });
});
