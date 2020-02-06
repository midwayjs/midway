import { ObjectCreator } from '../../src/definitions/objectCreator';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { expect } from 'chai';
import path = require('path');
import sinon = require('sinon');

describe('/test/definitions/objectCreator.test.ts', () => {
  it('object creator should be ok', async () => {
    const definition = new ObjectDefinition();
    definition.id = 'mytest';
    definition.path = path.join(__dirname, '../fixtures/singleton_sample');
    definition.export = 'HelloSingleton';
    const creator = new ObjectCreator(definition);
    const obj = creator.load();
    expect(obj).is.a('function');
    expect(obj.name).eq('HelloSingleton');

    expect(creator.doConstruct(null)).is.an('object');

    definition.direct = true;
    expect(creator.doConstruct(111)).eq(111);

    definition.direct = false;
    definition.constructMethod = 'say';
    expect(creator.doConstruct({
      say(a) {
        return a;
      }
    }, [123])).eq(123);

    expect(await creator.doConstructAsync({
      *say(a) {
        return a;
      }
    }, [1234])).eq(1234);
    expect(await creator.doConstructAsync({
      async say(a) {
        return a;
      }
    }, [12345])).eq(12345);

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

    expect(callback.withArgs('mytest not valid by context.get, Use context.getAsync instead!').calledTwice).true;

    await creator.doInitAsync({
      say(cb) {
        callback('doInitAsync cb');
        cb();
      }
    });
    expect(callback.withArgs('doInitAsync cb').calledOnce).true;

    await creator.doInitAsync({
      say() {
        callback('doInitAsync cb1');
      }
    });
    expect(callback.withArgs('doInitAsync cb1').calledOnce).true;

    definition.destroyMethod = 'destroy';
    creator.doDestroy({
      destroy() {
        callback('destroy1');
      }
    });
    expect(callback.withArgs('destroy1').calledOnce).true;

    await creator.doDestroyAsync({
      destroy() {
        callback('destroy async1');
      }
    });
    expect(callback.withArgs('destroy async1').calledOnce).true;

    await creator.doDestroyAsync({
      *destroy() {
        callback('destroy asyncg1');
      }
    });
    expect(callback.withArgs('destroy asyncg1').calledOnce).true;

    await creator.doDestroyAsync({
      async destroy() {
        callback('destroy asynca1');
      }
    });
    expect(callback.withArgs('destroy asynca1').calledOnce).true;

    await creator.doDestroyAsync({
      destroy(cb) {
        callback('destroy asynccb1');
        cb();
      }
    });
    expect(callback.withArgs('destroy asynccb1').calledOnce).true;
  });
});
