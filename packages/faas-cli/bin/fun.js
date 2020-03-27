#!/usr/bin/env node
'use strict';
const core = require("@midwayjs/fcli-command-core");
core.debug({
  debugFile: __filename,
  callback: argv => {
    require('source-map-support/register');
    const { CLI } = require('../dist');
    const cli = new CLI(argv);
    cli.start();
  }
});
