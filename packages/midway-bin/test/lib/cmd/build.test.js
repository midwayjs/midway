'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('mz-modules/rimraf');

describe('test/lib/cmd/build.test.js', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');

  afterEach(mm.restore);

  it('should warn message', function* () {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-without-config');
    const child = coffee.fork(midwayBin, [ 'build' ], { cwd })
      .expect('stdout', /tsconfig/);

    yield child.expect('code', 0).end();
  });

  it('should build success', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    yield rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(midwayBin, [ 'build' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    yield rimraf(path.join(cwd, 'dist'));
  });

  it('should auto clean dir before build', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    const child = coffee.fork(midwayBin, [ 'build' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    yield rimraf(path.join(cwd, 'dist'));
  });

  it('should copy assets file to dist dir', function *() {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-with-assets');
    const child = coffee.fork(midwayBin, [ 'build', '-c' ], { cwd });
    yield child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/view/index.html')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/resource.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/b.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/a.text')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/ignore.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/sub/sub_ignore.css')));
    yield rimraf(path.join(cwd, 'dist'));
  });

});
