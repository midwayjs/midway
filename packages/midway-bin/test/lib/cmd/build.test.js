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

  it('should warn message', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-without-config');
    const child = coffee
      .fork(midwayBin, [ 'build' ], { cwd })
      .expect('stdout', /tsconfig/);

    await child.expect('code', 0).end();
  });

  it('should build success', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    await rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(midwayBin, [ 'build' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should auto clean dir before build', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    const child = coffee.fork(midwayBin, [ 'build' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should copy assets file to dist dir', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-with-assets');
    const child = coffee.fork(midwayBin, [ 'build', '-c' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/view/index.html')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/resource.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/b.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/a.text')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/ignore.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/sub/sub_ignore.css')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should copy assets file and ignore not exists directory', async () => {
    const cwd = path.join(
      __dirname,
      '../../fixtures/ts-dir-with-not-exists-file'
    );
    const child = coffee.fork(midwayBin, [ 'build', '-c' ], { cwd }).debug();
    await child.expect('code', 0).end();
    assert(!fs.existsSync(path.join(cwd, 'dist/view/index.html')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.js')));
    await rimraf(path.join(cwd, 'dist'));
  });
});

describe('test/lib/cmd/build.test.js - with another tsconfig', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');

  afterEach(mm.restore);

  it('should warn message', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-without-config');
    const child = coffee
      .fork(midwayBin, [ 'build', '-p', 'tsconfig.prod.json' ], { cwd })
      .expect('stdout', /tsconfig/);

    await child.expect('code', 0).end();
  });

  it('should build success with another tsconfig', async () => {
    const cwd = path.join(
      __dirname,
      '../../fixtures/ts-dir-with-another-tsconfig'
    );
    await rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(
      midwayBin,
      [ 'build', '-p', 'tsconfig.prod.json' ],
      { cwd }
    );
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should auto clean dir before build with another tsconfig', async () => {
    const cwd = path.join(
      __dirname,
      '../../fixtures/ts-dir-with-another-tsconfig'
    );
    await rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(
      midwayBin,
      [ 'build', '-p', 'tsconfig.prod.json' ],
      { cwd }
    );
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should copy assets file to dist dir with another tsconfig', async () => {
    const cwd = path.join(
      __dirname,
      '../../fixtures/ts-dir-with-assets-and-another-tsconfig'
    );

    const child = coffee.fork(
      midwayBin,
      [ 'build', '-c', '-p', 'tsconfig.prod.json' ],
      { cwd }
    );
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/view/index.html')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/public/test.js')));
    assert(fs.existsSync(path.join(cwd, 'dist/resource.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/b.json')));
    assert(fs.existsSync(path.join(cwd, 'dist/lib/a.text')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/ignore.css')));
    assert(fs.existsSync(path.join(cwd, 'dist/pattern/sub/sub_ignore.css')));
    await rimraf(path.join(cwd, 'dist'));
  });
});

describe('test/lib/cmd/build.test.js - bundling', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');

  afterEach(mm.restore);

  it('should warn message', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir-without-config');
    const child = coffee
      .fork(midwayBin, [ 'build', '--entrypoint', 'a.ts' ], { cwd })
      .expect('stdout', /tsconfig/);

    await child.expect('code', 0).end();
  });

  it('should build success', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    await rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(midwayBin, [ 'build', '--entrypoint', 'a.ts' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });

  it('should auto clean dir before build', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    const child = coffee.fork(midwayBin, [ 'build', '--entrypoint', 'a.ts' ], { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    await rimraf(path.join(cwd, 'dist'));
  });
});

describe('test/lib/cmd/build.test.js - minify', () => {
  const midwayBin = require.resolve('../../../bin/midway-bin.js');
  const argv = [ 'build', '-c', '--minify'];

  afterEach(mm.restore);

  it('should build success', async () => {
    const cwd = path.join(__dirname, '../../fixtures/ts-dir');
    await rimraf(path.join(cwd, 'dist'));
    const child = coffee.fork(midwayBin, argv, { cwd });
    await child.expect('code', 0).end();
    assert(fs.existsSync(path.join(cwd, 'dist/a.js')));
    assert(/\/\/# sourceMappingURL/.exec(fs.readFileSync(path.join(cwd, 'dist/a.js'), 'utf8')));
    await rimraf(path.join(cwd, 'dist'));
  });
});
