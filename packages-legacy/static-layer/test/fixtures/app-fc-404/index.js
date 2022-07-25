'use strict';

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-fc-starter');
const StaticLayer = require('../../../index');

let runtime;
let inited;

async function initializeMethod() {
  if(!inited) {
    inited = true;
    runtime = await start({
      layers: [StaticLayer],
      isAppMode: true,
      runtimeConfig: {
        deployType: {
          config: {
            rootDir: 'build',
            notFoundUrl: '/404.html'
          }
        }
      }
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
