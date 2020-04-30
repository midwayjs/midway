#!/usr/bin/env node
'use strict';
const { cli } = require('./cli');
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
cli(argv);
