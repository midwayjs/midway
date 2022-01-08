---
title: 默认错误行为
---

## 错误值处理

​

为了保证安全性，Midway 针对 Serverless 场景下返回的错误做了一些特殊处理。
​

在函数业务抛出错误的情况下，框架侧会捕获所有的错误，并返回 “Internal Server Error” 的错误。
​

比如我们的函数返回一个错误：

```typescript
@ServerlessTrigger(//...)
async invoke() {
	throw new Error('abc');
}
```

​

不管是 HTTP 还是非 HTTP 触发器，框架部分都有相应的处理。
​

在 **非线上环境**，比如 `NODE_ENV=local` 环境，框架会将整个错误通过网关透出。
​

比如（完整的错误堆栈）：

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

​

在 线上环境，框架将直接返回 **“Internal Server Error”** ，但是日志中是完整的堆栈。
​

如图所示。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1625205528496-96f7d2b8-d728-4f04-82f4-f2617e00720b.png#clientId=uf90c84ad-5af6-4&from=paste&height=184&id=u9c48573b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=184&originWidth=533&originalType=binary&ratio=1&size=7090&status=done&style=none&taskId=u9ff827c3-41a4-4b19-bedb-83ee598cc4e&width=533" width="533" />

**​**

**​**

​

## 调整错误返回

以上为默认行为，在特殊环境下，如果需要显示出错误，可以使用环境变量开启强制输出。

```typescript
process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
```
