#!/usr/bin/env node
'use strict';
const CliClass = require('../src');
const cli = new CliClass(process.argv);
cli.start();