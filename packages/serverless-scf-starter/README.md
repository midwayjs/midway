# serverless SCF starter

本模块用于包裹无法定制运行时的 FaaS 平台，比如阿里云 FC。

## 腾讯云 SCF

```ts
import { asyncWrapper, start } from '@midwayjs/serverless-fc-starter';

let runtime;
export.init = asyncWrapper(async () => {
  runtime = await start();
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
