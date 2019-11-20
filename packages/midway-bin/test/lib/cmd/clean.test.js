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

  it('should clean dir', async () => {
    const cwd = path.join(__dirname, '../../fixtures/clean-dir');
    await mkdirp(path.join(cwd, 'logs/test.log'));
    await mkdirp(path.join(cwd, '.nodejs-cache/test.log'));
    await mkdirp(path.join(cwd, 'run/a.log'));

    const child = coffee.fork(midwayBin, [ 'clean' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'a.ts')));
    assert(!fs.existsSync(path.join(cwd, '.nodejs-cache')));
    assert(!fs.existsSync(path.join(cwd, 'run')));
    assert(!fs.existsSync(path.join(cwd, 'logs')));
  });

  it('should clean file with config', async () => {
    const cwd = path.join(__dirname, '../../fixtures/clean-dir-config');
    await mkdirp(path.join(cwd, 'customDir/a.js'));

    const child = coffee.fork(midwayBin, [ 'clean' ], { cwd });
    await child.expect('code', 0).end();
    assert(!fs.existsSync(path.join(cwd, 'customDir')));
  });

});
