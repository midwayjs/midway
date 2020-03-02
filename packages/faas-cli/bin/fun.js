#!/usr/bin/env node
'use strict';

require('source-map-support/register');

const { CLI } = require('../dist');
const cli = new CLI(process.argv);
cli.start();
