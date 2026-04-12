import * as assert from 'assert';
import { join } from 'path';
import {
  safeRequire,
  safelyGet,
  joinURLPath,
  delegateTargetPrototypeMethod,
  delegateTargetMethod,
  delegateTargetProperties,
  transformRequestObjectByType,
  isIncludeProperty,
  delegateTargetAllPrototypeMethod,
  loadModule,
  sleep,
} from '../../src/util';
import { PathFileUtils } from '../../src';
import * as EventEmitter from 'events';
import { fork } from 'child_process';

describe('/test/util/util.test.ts', () => {

  it('should test safeRequire', () => {
    // assert.ok(safeRequire('@ali/abc') === undefined);
    // assert.ok(safeRequire('url') === require('url'));
    //
    // assert.strictEqual(safeRequire(join(__dirname, '../fixtures/dir/ok')), require('./fixtures/dir/ok'));
    // assert.strictEqual(safeRequire(join(__dirname, '../fixtures/foo')), undefined);
    assert.strictEqual(safeRequire(join(__dirname, '../fixtures/dir/nok.js')), undefined);
    assert.strictEqual(safeRequire('../fixtures/dir/bbb/nok.js'), undefined);
  });

  it('should test loadModule', async () => {
    expect(await loadModule(join(__dirname, '../fixtures/dir/nok.js'), {safeLoad: true})).toBeUndefined();
    expect(await loadModule('../fixtures/dir/bbb/nok.js', {safeLoad: true})).toBeUndefined();
  });

  it('should test load module with esm', async () => {
    let child = fork('esm.mjs', [], {
      cwd: join(__dirname, './esm-fixtures'),
      execArgv: [
        '--loader',
        'ts-node/esm',
      ]
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`process exited with code ${code}`);
      }
    });

    await new Promise<void>((resolve, reject) => {
      child.on('message', (ready) => {
        if (ready === 'ready') {
          resolve();
        }
      });
    });

    await sleep(1000);
  });

  it('should safeGet be ok', () => {
    const fn = safelyGet(['a', 'b']);
    assert.deepEqual(2, fn({a: {b: 2}}), 'safelyGet one argument not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b'], null), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a1', 'b1'], {a: {b: 2}}), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b2'], {a: 2}), 'safelyGet obj is number not ok');
  });
});

describe('/test/pathFileUtil.test.ts', () => {
  it('should test is path', () => {
    assert.ok(PathFileUtils.isPath('@ali/abc') === false);
    assert.ok(PathFileUtils.isPath('def') === false);
    assert.ok(PathFileUtils.isPath('bbb-ccc') === false);
    assert.ok(PathFileUtils.isPath('./hello') === true);
    assert.ok(PathFileUtils.isPath('../hello') === true);
    assert.ok(PathFileUtils.isPath('../../bbb') === true);
    assert.ok(PathFileUtils.isPath('/home/admin/logs') === true);
    assert.ok(PathFileUtils.isPath('C:\\Program Files') === true);
  });

  it('should isPathEqual be ok', () => {
    assert.ok(PathFileUtils.isPathEqual(null, null) === false);
    assert.ok(PathFileUtils.isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', null) === false);
    assert.ok(PathFileUtils.isPathEqual(null, '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration') === false);
    assert.ok(PathFileUtils.isPathEqual('/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration.ts', '/midway-open/packages/midway-core/test/fixtures/app-with-configuration/base-app-no-package-json/src/configuration'));
  });

  it('should test join url path', function () {
    expect(joinURLPath('/api', '/')).toEqual('/api');
    expect(joinURLPath('/api/', '/')).toEqual('/api');
    expect(joinURLPath('//api', '/')).toEqual('/api');
    expect(joinURLPath('/api', '//')).toEqual('/api');
    expect(joinURLPath('api', '//')).toEqual('/api');
    expect(joinURLPath('api', '*')).toEqual('/api/*');
    expect(joinURLPath('/:api/:name', '*')).toEqual('/:api/:name/*');
    expect(joinURLPath('/api/:name', '*')).toEqual('/api/:name/*');
    expect(joinURLPath('*')).toEqual('/*');
    expect(joinURLPath('/', '*')).toEqual('/*');
    expect(joinURLPath('/', '/*')).toEqual('/*');
    expect(joinURLPath(undefined, '/*')).toEqual('/*');
    expect(joinURLPath(undefined, '/*', null)).toEqual('/*');
  });

  it('should test delegate util method', async () => {
    class Source {
      a = 123;
      hello() {
        return 'world'
      }
      async getData() {
        return {
          test: 'a'
        }
      }
      getInfo() {
        return new Promise(resolve => {
          resolve({
            ddd: 'bbb'
          })
        });
      }
    }
    const source = new Source();
    class TargetA {
      instance = source;
    }
    class TargetB {
      instance = source;
    }
    class TargetC {
      instance = source;
    }

    delegateTargetPrototypeMethod(TargetA, [Source]);
    delegateTargetMethod(TargetB, [
      'hello',
      'getData',
      'getInfo'
    ]);
    delegateTargetProperties(TargetC, [
      'a',
    ]);

    const a: any = new TargetA();
    expect(a.a).toBeUndefined();
    expect(a.hello()).toEqual('world');
    expect(await a.getData()).toEqual({
      test: 'a',
    });
    expect(await a.getInfo()).toEqual({
      ddd: 'bbb'
    });

    const b: any = new TargetB();
    expect(b.a).toBeUndefined();
    expect(b.hello()).toEqual('world');
    expect(await b.getData()).toEqual({
      test: 'a',
    });
    expect(await b.getInfo()).toEqual({
      ddd: 'bbb'
    });

    const c: any = new TargetC();
    expect(c.a).toEqual(123);
    expect(c.hello).toBeUndefined();
    expect(c.getData).toBeUndefined();
    expect(c.getInfo).toBeUndefined();
  });

  it('should transform plain to target type', function () {
    expect(transformRequestObjectByType('1', Number)).toEqual(1);
    expect(transformRequestObjectByType('1.001', Number)).toEqual(1.001);
    expect(transformRequestObjectByType('1.001', String)).toEqual('1.001');
    expect(transformRequestObjectByType('1.001', Boolean)).toEqual(true);
    expect(transformRequestObjectByType(true, Boolean)).toEqual(true);
    expect(transformRequestObjectByType('true', Boolean)).toEqual(true);
    // expect(transformRequestObjectByType(undefined, Boolean)).toEqual(false);
    expect(transformRequestObjectByType(null, Boolean)).toEqual(false);
    expect(transformRequestObjectByType(false, Boolean)).toEqual(false);
    expect(transformRequestObjectByType(0, Boolean)).toEqual(false);
    // special
    expect(transformRequestObjectByType('0', Boolean)).toEqual(false);
    expect(transformRequestObjectByType('false', Boolean)).toEqual(false);
  });

  it('should test object property writable', function () {
    const context = require('koa/lib/context');
    const newContext = Object.create(context);
    expect(isIncludeProperty(newContext, 'body')).toBeTruthy();
    expect(isIncludeProperty(newContext, 'xxx')).toBeFalsy();
  });

  it('should delegate all method for class', function () {
    class TargetA extends EventEmitter {
      invoke() {
        return 'A';
      }
    }
    class TargetB extends TargetA {
    }
    class TargetC extends TargetB {
      invoke() {
        return 'C';
      }
    }

    class TargetD {
      instance = new TargetC();
    }

    delegateTargetAllPrototypeMethod(TargetD, TargetC);

    const d = new TargetD();
    expect(d['invoke']()).toEqual('C');
  });
});
