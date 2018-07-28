'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');
const mkdirp = require('mz-modules/mkdirp');

describe('test/lib/cmd/clean.test.js', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');

  afterEach(mm.restore);

  it('should clean dir', function *() {
    const cwd = path.join(__dirname, '../../fixtures/clean-dir');
    yield mkdirp(path.join(cwd, 'logs/test.log'));
    yield mkdirp(path.join(cwd, '.nodejs-cache/test.log'));
    yield mkdirp(path.join(cwd, 'run/a.log'));

    const child = coffee.fork(midwayBin, [ 'clean' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'a.ts')));
    assert(!fs.existsSync(path.join(cwd, '.nodejs-cache')));
    assert(!fs.existsSync(path.join(cwd, 'run')));
    assert(!fs.existsSync(path.join(cwd, 'logs')));
  });

  it('should clean file with config', function *() {
    const cwd = path.join(__dirname, '../../fixtures/clean-dir-config');
    yield mkdirp(path.join(cwd, 'customDir/a.js'));

    const child = coffee.fork(midwayBin, [ 'clean'], { cwd });
    yield child.expect('code', 0).end();
    assert(!fs.existsSync(path.join(cwd, 'customDir')));
  });

});
