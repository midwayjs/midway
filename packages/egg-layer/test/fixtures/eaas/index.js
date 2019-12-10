'use strict';

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-fc-starter');
const eggLayer = require('../../../dist');

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start({
      layers: [eggLayer]
    });
  }
  return runtime.asyncEvent()(...args);
});
