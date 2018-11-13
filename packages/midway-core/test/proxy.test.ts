import * as assert from 'assert';

describe('/test/proxy.test.ts', () => {
  it('should proxy app when set property', () => {
    let app = {};
    let pluginContext = {};

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

    assert(pluginContext['test'] === 1);
    assert(pluginContext['key'] === 123);
  });
});
