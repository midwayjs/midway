'use strict';

const assert = require('power-assert');
const mock = require('./dist').mm;

const options = {};
const app = mock.app(options);

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
