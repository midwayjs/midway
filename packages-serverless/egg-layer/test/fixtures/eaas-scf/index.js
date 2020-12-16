'use strict';

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-scf-starter');
const eggLayer = require('../../../');

let runtime;
let inited;

async function initializeMethod() {
  if(!inited) {
    inited = true;
    runtime = await start({
      layers: [eggLayer],
      isAppMode: true
    });
  }
}

exports.initializer = asyncWrapper(async (...args) => {
  await initializeMethod();
});

exports.handler = asyncWrapper(async (...args) => {
  await initializeMethod();
  return runtime.asyncEvent()(...args);
});
