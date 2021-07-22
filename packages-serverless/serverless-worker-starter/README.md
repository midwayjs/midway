# serverless worker starter

本模块用于包裹无法定制运行时的 FaaS 平台，比如阿里云 FC。

## Serverless Worker

```ts
import { eventWaitUntil, eventRespondWith, start } from '@midwayjs/serverless-worker-starter';

let runtime;
addEventListener('install', eventWaitUntil(async event => {
  runtime = await start();
}));

addEventListener('fetch', eventRespondWith(async event => {
  return runtime.asyncEvent(async function(ctx) {
    return 'hello world';  // ctx.body = 'hello world';
  })(event);
}));
```
