'use strict';

module.exports = {
  write: true,
  prefix: '^',
  devprefix: '^',
  exclude: [
    'test/fixtures',
    'examples',
    'docs',
    'run',
  ],
  dep: [
    "injection"
  ],
  devdep: [
  ],
  keep: [
  ]
};
