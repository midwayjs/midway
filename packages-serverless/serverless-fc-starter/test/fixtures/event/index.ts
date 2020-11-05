import { asyncWrapper, start } from '../../../src';

let runtime;
exports.init = asyncWrapper(async () => {
  runtime = await start();
});

exports.handler = asyncWrapper(async (...args) => {
  return runtime.asyncEvent(async function (ctx, event) {
    return 'hello world';
  })(...args);
});
