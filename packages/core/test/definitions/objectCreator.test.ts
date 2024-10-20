import { ObjectCreator } from '../../src/definitions/objectCreator';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import * as path from 'path';
import * as sinon from 'sinon';

describe('/test/definitions/objectCreator.test.ts', () => {
  it('object creator should be ok', async () => {
    const definition = new ObjectDefinition();
    definition.id = 'mytest';
    const creator = new ObjectCreator(definition);

    definition.path = '';
    expect(creator.load()).toBeNull();

    definition.path = path.join(__dirname, '../fixtures/singleton_sample');
    definition.export = '';
    const oo = creator.load();
    expect(Object.keys(oo).length).toBeGreaterThan(2);

    definition.export = 'HelloSingleton';

    const obj = creator.load();
    expect(typeof obj).toEqual('function');
    expect(obj.name).toEqual('HelloSingleton');

    // 修改这里，传入一个构造函数和空数组作为参数
    expect(typeof creator.doConstruct(function() {}, [])).toEqual('object');

    definition.constructMethod = 'say';
    expect(creator.doConstruct({
      say(a) {
        return a;
      }
    }, [123])).toEqual(123);

    const callback = sinon.spy();
    definition.initMethod = 'say';
    const mockContext: any = { get: () => ({}) };

    try {
      creator.doInit({
        *say(a) {
          return a;
        }
      }, mockContext);
    } catch (e) {
      callback(e.message);
    }

    try {
      creator.doInit({
        say(a) {
          return new Promise(resolve => {
            resolve(a);
          });
        }
      }, mockContext);
    } catch (e) {
      callback(e.message);
    }

    expect(callback.withArgs('mytest not valid by context.get, Use context.getAsync instead!').calledTwice).toBeTruthy();

    await creator.doInitAsync({
      say(cb) {
        callback('doInitAsync cb');
        cb();
      }
    }, mockContext);
    expect(callback.withArgs('doInitAsync cb').calledOnce).toBeTruthy();

    await creator.doInitAsync({
      say() {
        callback('doInitAsync cb1');
      }
    }, mockContext);
    expect(callback.withArgs('doInitAsync cb1').calledOnce).toBeTruthy();

    definition.destroyMethod = 'destroy';
    creator.doDestroy({
      destroy() {
        callback('destroy1');
      }
    });
    expect(callback.withArgs('destroy1').calledOnce).toBeTruthy();

    await creator.doDestroyAsync({
      destroy() {
        callback('destroy async1');
      }
    });
    expect(callback.withArgs('destroy async1').calledOnce).toBeTruthy();

    await creator.doDestroyAsync({
      async destroy() {
        callback('destroy asynca1');
      }
    });
    expect(callback.withArgs('destroy asynca1').calledOnce).toBeTruthy();

    await creator.doDestroyAsync({
      destroy(cb) {
        callback('destroy asynccb1');
        cb();
      }
    });
    expect(callback.withArgs('destroy asynccb1').calledOnce).toBeTruthy();
  });
});
