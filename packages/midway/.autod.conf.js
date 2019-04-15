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
    'cluster'
  ],
  dep: [
    "egg-cluster",
  ],
  devdep: [
  ]
};
