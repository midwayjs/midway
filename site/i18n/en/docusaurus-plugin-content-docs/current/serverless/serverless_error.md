---
title: 默认错误行为
---

## Error value processing



In order to ensure security, Midway has done some special treatment for errors returned in Serverless scenarios.


When the function business throws an error, the frame side will catch all the errors and return the error of "Internal Server Error.


For example, our function returns an error:

```typescript
@ServerlessTrigger(//...)
async invoke() {
  throw new Error('abc');
}
```



Whether it is HTTP or non-HTTP triggers, the framework part has corresponding processing.


In **off-line environments**, such as `NODE_ENV = local`, the framework will reveal the entire error through the gateway.


For example (complete error stack):

```
2021-07-02T05:57:08.553Z 19be4d99-c9cb-4c4c-aac2-9330d31b4408 [error] Error: abc
    at hello (/code/dist/function/index.js:17:15)
    at invokeHandler (/code/node_modules/_@midwayjs_faas@2.11.2-beta.1@@midwayjs/faas/dist/framework.js:174:56)
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
    at (/code/node_modules/_@midwayjs_faas@2.11.2-beta.1@@midwayjs/faas/dist/framework.js:117:40)
    at cors (/code/node_modules/_@koa_cors@3.1.0@@koa/cors/index.js:98:16)
    at invokeHandlerWrapper (/code/node_modules/_@midwayjs_runtime-engine@2.11.1@@midwayjs/runtime-engine/dist/lightRuntime.js:18:28) {
}
```



In the online environment, the framework will directly return **"Internal Server Error"**, but the log is a complete stack.


As shown in Fig.

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1625205528496-96f7d2b8-d728-4f04-82f4-f2617e00720b.png#clientId=uf90c84ad-5af6-4&from=paste&height=184&id=u9c48573b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=184&originWidth=533&originalType=binary&ratio=1&size=7090&status=done&style=none&taskId=u9ff827c3-41a4-4b19-bedb-83ee598cc4e&width=533" width="533" />



## Adjustment error return

The above is the default behavior. If an error needs to be displayed in a special environment, you can use the environment variable to enable forced output.

```typescript
process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
```
