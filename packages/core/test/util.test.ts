import * as assert from 'assert';
import { join } from 'path';
import { safeRequire, safelyGet } from '../src/util';
import { PathFileUtil } from '../src/';
import { StaticConfigLoader } from '../src/util/staticConfig';

describe('/test/util.test.ts', () => {

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

  it('should load static config from app', async () => {
    let loader = new StaticConfigLoader(join(__dirname, '/fixtures/app-with-configuration-static-config-loader/base-app-decorator'), 'local');
    let configText = await loader.getSerializeConfig();
    expect(configText['helloworld']).toEqual(234);
    expect(configText['ok']['text']).toEqual('ok3');
    expect(configText['mock']['b']).toEqual('local');

    loader = new StaticConfigLoader(join(__dirname, '/fixtures/app-with-configuration-static-config-loader/base-app-decorator'), 'production');
    configText = await loader.getSerializeConfig();
    expect(configText['helloworld']).toEqual(123);
    expect(configText['ok']['text']).toEqual('ok');
    expect(configText['mock']['b']).toEqual('test');
  });
});

describe('/test/pathFileUtil.test.ts', () => {
  it('should test is path', () => {
    assert(PathFileUtil.isPath('@ali/abc') === false);
    assert(PathFileUtil.isPath('def') === false);
    assert(PathFileUtil.isPath('bbb-ccc') === false);
    assert(PathFileUtil.isPath('./hello') === true);
    assert(PathFileUtil.isPath('../hello') === true);
    assert(PathFileUtil.isPath('../../bbb') === true);
    assert(PathFileUtil.isPath('/home/admin/logs') === true);
    assert(PathFileUtil.isPath('C:\\Program Files') === true);
  });

  it('should isPathEqual be ok', () => {
    assert.ok(PathFileUtil.isPathEqual(null, null) === false);
    assert.ok(PathFileUtil.isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', null) === false);
    assert.ok(PathFileUtil.isPathEqual(null, '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration') === false);
    assert.ok(PathFileUtil.isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration'));
  });

});
