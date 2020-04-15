import { asyncWrapper, start } from '../../../src';

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start();
  }
  return runtime.asyncEvent(async function (ctx, event) {
    ctx.status = 200;
    ctx.body = {
      headers: ctx.headers,
      method: ctx.method,
      path: ctx.path,
      body: ctx.request.body,
      params: ctx.params,
    };
  })(...args);
});
