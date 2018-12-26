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
  ],
  devdep: [
  ],
  keep: [
    "egg",
    "egg-core"
  ]
};
