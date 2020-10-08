import * as assert from 'assert';
import { join } from 'path';
import { isPath, safeRequire, safelyGet, isPathEqual } from '../src/common/util';
import { StaticConfigLoader } from '../src/util/staticConfig';

describe('/test/util.test.ts', () => {
  it('should test is path', () => {
    assert(isPath('@ali/abc') === false);
    assert(isPath('def') === false);
    assert(isPath('bbb-ccc') === false);
    assert(isPath('./hello') === true);
    assert(isPath('../hello') === true);
    assert(isPath('../../bbb') === true);
    assert(isPath('/home/admin/logs') === true);
    assert(isPath('C:\\Program Files') === true);
  });

  it('should test safeRequire', () => {
    // assert(safeRequire('@ali/abc') === undefined);
    // assert(safeRequire('url') === require('url'));
    //
    // assert.strictEqual(safeRequire(join(__dirname, './fixtures/dir/ok')), require('./fixtures/dir/ok'));
    // assert.strictEqual(safeRequire(join(__dirname, './fixtures/foo')), undefined);
    assert.strictEqual(safeRequire(join(__dirname, './fixtures/dir/nok.js')), undefined);
    assert.strictEqual(safeRequire('./fixtures/dir/bbb/nok.js'), undefined);
  });

  it('should safeGet be ok', () => {
    const fn = safelyGet(['a', 'b']);
    assert.deepEqual(2, fn({a: {b: 2}}), 'safelyGet one argument not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b'], null), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a1', 'b1'], {a: {b: 2}}), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b2'], {a: 2}), 'safelyGet obj is number not ok');
  });

  it('should isPathEqual be ok', () => {
    assert.ok(isPathEqual(null, null) === false);
    assert.ok(isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', null) === false);
    assert.ok(isPathEqual(null, '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration') === false);
    assert.ok(isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration'));
  });

  it('should load static config from app', async () => {
    const loader = new StaticConfigLoader(join(__dirname, '/fixtures/app-with-configuration-static-config-loader/base-app-decorator'), 'local');
    const configText = await loader.getSerializeConfig();
    console.log(configText);
  });
});
