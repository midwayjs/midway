# serverless aws starter

this module is a light runtime starter for amazon lambda.

```ts
import { asyncWrapper, createRuntime } from '@midwayjs/serverless-aws-starter';

let runtime;
export.init = asyncWrapper(async () => {
  runtime = await createRuntime();
});

// for web request
export.handler = asyncWrapper(async (...args) => {
  return runtime.asyncEvent(async function(ctx) {
    return 'hello world';  // ctx.body = 'hello world';
  })(...args);
});

// for event
export.handler = asyncWrapper(async (...args) => {
  return runtime.asyncEvent(async function(ctx, event) {
    return {data: 1};
  })(...args);
});

```
