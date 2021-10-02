import { ObjectCreator } from '../../src/definitions/objectCreator';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import path = require('path');
import sinon = require('sinon');

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

    expect(typeof creator.doConstruct(null)).toEqual('object');

    definition.constructMethod = 'say';
    expect(creator.doConstruct({
      say(a) {
        return a;
      }
    }, [123])).toEqual(123);

    expect(await creator.doConstructAsync({
      say(a) {
        return a;
      }
    }, [123])).toEqual(123);

    // expect(await creator.doConstructAsync({
    //   *say(a) {
    //     return a;
    //   }
    // }, [1234])).eq(1234);
    expect(await creator.doConstructAsync({
      async say(a) {
        return a;
      }
    }, [12345])).toEqual(12345);

    const callback = sinon.spy();
    definition.initMethod = 'say';
    try {
      creator.doInit({
        *say(a) {
          return a;
        }
      });
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
      });
    } catch (e) {
      callback(e.message);
    }

    expect(callback.withArgs('mytest not valid by context.get, Use context.getAsync instead!').calledTwice).toBeTruthy();

    await creator.doInitAsync({
      say(cb) {
        callback('doInitAsync cb');
        cb();
      }
    });
    expect(callback.withArgs('doInitAsync cb').calledOnce).toBeTruthy();

    await creator.doInitAsync({
      say() {
        callback('doInitAsync cb1');
      }
    });
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

    // await creator.doDestroyAsync({
    //   *destroy() {
    //     callback('destroy asyncg1');
    //   }
    // });
    // expect(callback.withArgs('destroy asyncg1').calledOnce).true;

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
