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
  delegateTargetAllPrototypeMethod
} from '../../src/util';
import { PathFileUtil } from '../../src';
import * as EventEmitter from 'events';

describe('/test/util/util.test.ts', () => {

  it('should test safeRequire', () => {
    // assert(safeRequire('@ali/abc') === undefined);
    // assert(safeRequire('url') === require('url'));
    //
    // assert.strictEqual(safeRequire(join(__dirname, '../fixtures/dir/ok')), require('./fixtures/dir/ok'));
    // assert.strictEqual(safeRequire(join(__dirname, '../fixtures/foo')), undefined);
    assert.strictEqual(safeRequire(join(__dirname, '../fixtures/dir/nok.js')), undefined);
    assert.strictEqual(safeRequire('../fixtures/dir/bbb/nok.js'), undefined);
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

    class A {
      a: number;
      b: number;
      invoke() {
        return this.a + this.b;
      }
    }

    const result: A = transformRequestObjectByType({
      a: 1,
      b: 2
    }, A);
    expect(result instanceof A).toBeTruthy();
    expect(result.invoke()).toEqual(3);
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
