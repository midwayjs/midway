'use strict';

const assert = require('power-assert');
const mock = require('./dist');

const options = {};
if (process.env.MIDWAY_BASE_DIR) options.baseDir = process.env.MIDWAY_BASE_DIR;
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
