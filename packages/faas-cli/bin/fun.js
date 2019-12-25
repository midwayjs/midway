#!/usr/bin/env node
'use strict';
const CliClass = require('../dist');
const cli = new CliClass.Cli(process.argv);
cli.start();