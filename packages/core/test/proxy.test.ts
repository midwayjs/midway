import * as assert from 'assert';
import { extend } from '../src';

describe('/test/proxy.test.ts', () => {
  it('should proxy app when set property', () => {
    let app = {};
    const pluginContext = {};

    app = new Proxy<any>(app, {
      defineProperty(target, prop, attributes) {
        pluginContext[prop] = attributes.value;
        return Object.defineProperty(target, prop, attributes);
      }
    });

    app['test'] = 1;

    Object.defineProperty(app, 'key', {
      value: 123,
      writable: false,
      configurable: false,
    });

    assert.ok(pluginContext['test'] === 1);
    assert.ok(pluginContext['key'] === 123);
  });

  it('should test merge array', () => {
    const target = extend(true, {
      a: [1, 2, 3, {}]
    }, {
      a: [3, 4]
    });
    assert.ok(target.a.length === 2);
  });
});
