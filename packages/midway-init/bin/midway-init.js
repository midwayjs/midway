#!/usr/bin/env node

'use strict';

const co = require('co');
const Command = require('..');
const pkgInfo = require('../package.json');

const options = {
  name: 'midway-init',
  pkgInfo,
};

co(function* () {
  const args = process.argv.slice(2);
  const cmd = new Command(Object.assign({}, options));
  yield cmd.run(process.cwd(), args);
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
