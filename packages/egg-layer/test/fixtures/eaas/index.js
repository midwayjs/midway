'use strict';

const { join } = require('path');
process.env.EGG_FRAMEWORK_DIR = join(__dirname, '../../../node_modules/egg');

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-fc-starter');
const eggLayer = require('../../../dist');

let runtime;
let inited;

exports.initializer = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start({
      layers: [eggLayer],
    });
  }
});

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start({
      layers: [eggLayer],
    });
  }
  return runtime.asyncEvent()(...args);
});
