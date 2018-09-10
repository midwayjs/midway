'use strict';

const assert = require('power-assert');
const mock = require('./dist').mm;

const options = {};
const app = mock.app(options);

before(() => app.ready());
afterEach(mock.restore);

module.exports = {
  assert,
  app,
  mock,
  mm: mock,
};

exports.assert = assert;
exports.app = app;
exports.mock = mock;
exports.mm = mock;
