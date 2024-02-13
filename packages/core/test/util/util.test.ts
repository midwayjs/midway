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
  createPromiseTimeoutInvokeChain,
} from '../../src/util';
import { PathFileUtil } from '../../src';
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
    assert.ok(PathFileUtil.isPath('@ali/abc') === false);
    assert.ok(PathFileUtil.isPath('def') === false);
    assert.ok(PathFileUtil.isPath('bbb-ccc') === false);
    assert.ok(PathFileUtil.isPath('./hello') === true);
    assert.ok(PathFileUtil.isPath('../hello') === true);
    assert.ok(PathFileUtil.isPath('../../bbb') === true);
    assert.ok(PathFileUtil.isPath('/home/admin/logs') === true);
    assert.ok(PathFileUtil.isPath('C:\\Program Files') === true);
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

  describe('test create timeout handler', () => {
    it('should test create timeout handler and throw error in user code', async () => {
      const result = await createPromiseTimeoutInvokeChain<number>({
        promiseItems: [
          (async () => {
            await sleep(10);
            throw new Error('error');
          })(),
          (() => {
            return 2 as any;
          })(),
          (async () => {
            await sleep(10);
            return 1;
          })(),
        ],
        onFail(err) {
          return 1;
        },
        methodName: 'configuration.onReady',
        timeout: 100,
      });

      expect(result).toEqual([1, 1]);
    });

    it('should test create timeout handler and return in 100ms', async () => {
      const result = await createPromiseTimeoutInvokeChain<number>({
        promiseItems: [
          (async () => {
            await sleep(10);
            return 0
          })(),
          (async () => {
            await sleep(30);
            return 0;
          })(),
        ],
        onFail(err) {
          return 1;
        },
        methodName: 'configuration.onReady',
        timeout: 100,
      });

      expect(result).toEqual([0, 0]);
    });

    it('should test create timeout handler and got result timeout', async () => {
      const result = await createPromiseTimeoutInvokeChain<number>({
        promiseItems: [
          (async () => {
            await sleep(200);
            return 0
          })(),
          (async () => {
            await sleep(30);
            return 0;
          })(),
        ],
        onFail(err) {
          return 1;
        },
        methodName: 'configuration.onReady',
        timeout: 100,
      });

      expect(result).toEqual([1, 0]);
    });

    it('should test promise sequential call and break on biz error', async () => {
      const result = await createPromiseTimeoutInvokeChain<number>({
        promiseItems: [
          (async () => {
            await sleep(10);
            throw new Error('error');
          })(),
          (() => {
            return 2 as any;
          })(),
          (async () => {
            await sleep(10);
            return 1;
          })(),
        ],
        onFail(err) {
          return 3;
        },
        methodName: 'configuration.onReady',
        timeout: 100,
        isConcurrent: false,
      });

      expect(result).toEqual([3]);
    });

    it('should test promise sequential call with meta and custom timeout', async () => {
      const p1 = (async () => {
        await sleep(10);
        return 3;
      })();

      const p2 = (() => {
        return 2 as any;
      })();

      const p3 = (async () => {
        await sleep(10);
        return 1;
      })();

      const result = await createPromiseTimeoutInvokeChain<number>({
        promiseItems: [
          {
            item: p1,
            meta: {
              name: 'p1',
            },
            timeout: 100,
          },
          {
            item: p2,
            meta: {
              name: 'p2',
            },
          },
          {
            item: p3,
            meta: {
              name: 'p3',
            },
          },
        ],
        onFail(err) {
          return 4;
        },
        methodName: 'configuration.onReady',
        timeout: 100,
        isConcurrent: false,
      });

      expect(result).toEqual([3, 1]);
    });

    it('should test promise sequential run code timeout', async () => {
      const p1 = (async () => {
        await sleep(100);
        return 3;
      })();

      const p2 = (async () => {
        return 2 as any;
      })();

      const p3 = (async () => {
        await sleep(10);
        return 1;
      })();

      const result = await createPromiseTimeoutInvokeChain<{
        value: number;
        name: string;
      }>({
        promiseItems: [
          {
            item: p2,
            meta: {
              name: 'p2',
            },
          },
          {
            item: p1,
            meta: {
              name: 'p1',
            },
          },
          {
            item: p3,
            meta: {
              name: 'p3',
            },
          },
        ],
        onFail(err, meta) {
          return {value: 4, name: meta.name, reason: err.message};
        },
        methodName: 'configuration.onReady',
        timeout: 50,
        isConcurrent: false,
      });

      expect(result).toEqual([
        2,
        {
          'name': 'p1',
          'reason': 'Invoke "configuration.onReady" running timeout(50ms)',
          'value': 4
        }
      ]);
    });

    it('should test promise sequential run code with custom timeout', async () => {
      const p1 = (async () => {
        await sleep(100);
        return 3;
      })();

      const p2 = (() => {
        return 2 as any;
      })();

      const p3 = (async () => {
        await sleep(10);
        return 1;
      })();

      const result = await createPromiseTimeoutInvokeChain<{
        value: number;
        name: string;
      }>({
        promiseItems: [
          {
            item: p1,
            meta: {
              name: 'p1',
            },
            timeout: 80
          },
          {
            item: p2,
            meta: {
              name: 'p2',
            },
          },
          {
            item: p3,
            meta: {
              name: 'p3',
            },
          },
        ],
        onFail(err, meta) {
          return {value: 4, name: meta.name, reason: err.message};
        },
        methodName: 'configuration.onReady',
        timeout: 50,
        isConcurrent: false,
      });

      expect(result).toEqual([{
        'name': 'p1',
        'reason': 'Invoke "configuration.onReady" running timeout(80ms)',
        'value': 4
      }]);
    });
  })
});
