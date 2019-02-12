'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('mz-modules/rimraf');

describe('test/lib/cmd/doc.test.js', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');

  afterEach(mm.restore);

  it('should generate doc use default value', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');

    const child = coffee.fork(midwayBin, [ 'doc'], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'doc/index.html')));
    yield rimraf(path.join(cwd, 'doc'));
  });

  it('should generate doc use custom value', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');

    const child = coffee.fork(midwayBin, [ 'doc', '-o', 'api' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'api/index.html')));
    yield rimraf(path.join(cwd, 'api'));
  });

  it('should generate doc', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-doc-options');

    const child = coffee.fork(midwayBin, [ 'doc', '--options', 'typedoc.js' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'docs/api/index.html')));
    yield rimraf(path.join(cwd, 'docs'));
  });

});
