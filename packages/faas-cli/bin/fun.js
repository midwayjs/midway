#!/usr/bin/env node
'use strict';
const { CLI } = require('../dist');
const cli = new CLI(process.argv);
cli.start();
