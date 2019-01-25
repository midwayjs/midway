'use strict';

const assert = require('power-assert');
const mock = require('./dist').mm;

const options = {};
const app = mock.app(options);

app.mockClassFunction = (className, methodName, fn) => {
  const def = app.applicationContext.registry.getDefinition(className);
  const clazz = def.path;
  if (clazz && typeof clazz === 'function') {
    app._mockFn(clazz.prototype, methodName, fn);
  }
};

before(() => app.ready());
afterEach(mock.restore);

// 由于使用Object.assign，丢了默认的mm执行函数，所以使用default输出mm
const mm = mock.default;

module.exports = {
  assert,
  app,
  mock,
  mm,
};

exports.assert = assert;
exports.app = app;
exports.mock = mock;
exports.mm = mm;
