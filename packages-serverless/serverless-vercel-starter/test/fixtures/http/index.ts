import { asyncWrapper, start } from '../../../src';

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start();
  }
  return runtime.asyncEvent(async function (ctx) {
    ctx.body = { path: ctx.path }
  })(...args);
});
