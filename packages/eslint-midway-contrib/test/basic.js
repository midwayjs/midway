/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies, @typescript-eslint/no-require-imports */
const test = require('tape');

const config = require('../base.js');


test('test basic properties of config', (tt) => {
  tt.ok(isObject(config.parserOptions));
  tt.ok(isObject(config.env));
  tt.ok(isObject(config.globals));
  tt.end();
});

function isObject(obj) {
  return !! (typeof obj === 'object' && obj);
}
