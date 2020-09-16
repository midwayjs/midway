'use strict';

const path = require('path');
const coffee = require('coffee');

describe('test/midway-bin.test.js', () => {
  const midwayBin = require.resolve('../bin/midway-bin.js');
  const cwd = path.join(__dirname, 'fixtures/test-files');

  describe('global options', () => {
    it('should show version', done => {
      coffee
        .fork(midwayBin, ['--version'], { cwd })
        // .debug()
        .expect('stdout', /\d+\.\d+\.\d+/)
        .expect('code', 0)
        .end(done);
    });

    it('should show help', done => {
      coffee
        .fork(midwayBin, ['--help'], { cwd })
        // .debug()
        .expect('stdout', /Usage: .*midway-bin.* \[command] \[options]/)
        .expect('code', 0)
        .end(done);
    });

    it('should show help when command not exists', done => {
      coffee
        .fork(midwayBin, ['not-exists'], { cwd })
        // .debug()
        .expect('stdout', /Usage: .*midway-bin.* \[command] \[options]/)
        .expect('code', 0)
        .end(done);
    });
  });
});
