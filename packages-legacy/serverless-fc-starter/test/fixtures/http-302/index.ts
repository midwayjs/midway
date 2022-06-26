import { asyncWrapper, start } from '../../../src';

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start();
  }
  return runtime.asyncEvent(async function (ctx) {
    ctx.status = 302;
    ctx.set('Location', 'https://github.com/midwayjs/midway');
  })(...args);
});
