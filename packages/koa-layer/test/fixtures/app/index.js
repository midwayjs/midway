'use strict';

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-fc-starter');
const KoaLayer = require('../../../');

let runtime;
let inited;

exports.initializer = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start({
      layers: [KoaLayer],
    });
  }
});

exports.handler = asyncWrapper(async (...args) => {

  // args[1] = new Proxy(args[1], {
  //   set: function(target, prop, receiver) {
  //     if(prop === 'headersSent') {
  //       throw new Error('can\'t set header now');
  //     }
  //   }
  // })


  if (!inited) {
    inited = true;
    runtime = await start({
      layers: [KoaLayer],
    });
  }
  return runtime.asyncEvent()(...args);
});
