import * as assert from 'assert';

import * as extend2 from 'extend2';


describe('/test/base.test.ts', () => {
  it('should proxy app when set property', () => {
    let app = {};
    const pluginContext = {};

    app = new Proxy<any>(app, {
      defineProperty(target, prop, attributes) {
        pluginContext[prop] = attributes.value;
        return Object.defineProperty(target, prop, attributes);
      },
    });

    app.test = 1;

    Object.defineProperty(app, 'key', {
      value: 123,
      writable: false,
      configurable: false,
    });

    assert(pluginContext.test === 1);
    assert(pluginContext.key === 123);
  });

  it('should test merge array', () => {
    const target = extend2(true, {
      a: [1, 2, 3, {} ],
    }, {
      a: [3, 4],
    });
    assert(target.a.length === 2);
  });
});
