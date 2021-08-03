import { asyncWrapper, start } from '../../../src';

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start();
  }
  return runtime.asyncEvent(async function (ctx) {
    if (ctx.query?.str) {
      return '123';
    }
    if (ctx.query?.noReturn) {
      return;
    }
    if (ctx.query?.error) {
      throw new Error('error')
    }
    if (ctx.query?.buffer) {
      ctx.status = 401;
      return Buffer.from('123');
    }
    return { path: ctx.path };
  })(...args);
});
