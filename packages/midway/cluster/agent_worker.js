'use strict';

const utils = require('./utils');
const options = JSON.parse(process.argv[2]);
utils.isNeedCompile(options);
require('egg-cluster/lib/agent_worker');
