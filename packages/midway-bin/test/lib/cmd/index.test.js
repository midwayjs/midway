'use strict';

const path = require('path');
const coffee = require('coffee');

const midwayBin = require.resolve('../../../bin/midway-bin.js');

describe('test/lib/cmd/index.test.js', () => {

  describe('autod command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'autod', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('cov command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'cov', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('debug command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'debug', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('dev command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'dev', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('pkg command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'pkgfiles', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('test command', () => {
    it('should stdout', async () => {
      const cwd = path.join(__dirname);
      await coffee.fork(midwayBin, [ 'test', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end();
    });
  });

  describe('build command', () => {
    it('should build ts file', done => {
      const cwd = path.join(__dirname);
      coffee.fork(midwayBin, [ 'build', '-h' ], { cwd })
      // .debug()
        .expect('stdout', /midway/)
        .expect('code', 0)
        .end(done);
    });
  });
});
