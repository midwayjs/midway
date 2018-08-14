'use strict';

const utils = require('./utils');
const options = JSON.parse(process.argv[2]);
utils.registerTypescriptEnvironment(options);
require('egg-cluster/lib/app_worker');
