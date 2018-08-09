'use strict';

const assert = require('power-assert');
const mock = require('./dist').default;

const options = {
  framework: 'midway'
};

if (process.env.EGG_BASE_DIR) options.baseDir = process.env.EGG_BASE_DIR;
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
exports.mm = mm;
