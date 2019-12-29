#!/usr/bin/env node
'use strict';
const CliClass = require('../dist');
const cli = new CliClass.AliCli(process.argv);
cli.start();