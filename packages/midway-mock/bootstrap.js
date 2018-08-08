'use strict';

const {
  assert,
  app,
  mock,
  mm
} = require('egg-mock/boostrap');
module.exports = require('egg-mock/bootstrap');

exports.assert = assert;
exports.app = app;
exports.mock = mock;
exports.mm = mm;
