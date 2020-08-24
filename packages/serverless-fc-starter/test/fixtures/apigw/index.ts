import { asyncWrapper, start } from '../../../src';
import { deepStrictEqual } from 'assert';

let runtime;
let inited;

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    runtime = await start();
  }
  return runtime.asyncEvent(async function (ctx, event) {
    deepStrictEqual(ctx.logger, console);
    deepStrictEqual(event.path, '/test');
    deepStrictEqual(event.httpMethod, 'POST');
    ctx.status = 200;
    ctx.set('set-cookie', [
      'bbbb=123; path=/; httponly'
    ]);
    ctx.body = {
      headers: ctx.headers,
      method: ctx.method,
      path: ctx.path,
      body: ctx.request.body,
      params: ctx.params,
      files: ctx.files
    };
  })(...args);
});
