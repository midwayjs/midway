---
title: 函数上下文
---

## Event 转换

Midway Serverless 针对不同平台的情况，进行了入参包裹，同时，在函数使用了 apigw（API 网关）和 http （阿里云）触发器的情况下，对入参（event）做了特殊处理，为了简化和统一写法，将 event 统一规则化成了类似 koa 写法的代码。

普通触发器场景：

```typescript
import { Context } from '@midwayjs/faas';
import { Provide } from '@midwayjs/decorator';

@Provide()
export class Index {

  @Inject()
  ctx: Context;

  @ServerlessTrigger(...)
	async handler(event) {
		return 'hello world'
	}
}
```

HTTP 、API 网关触发器场景：

```typescript
import { Context } from '@midwayjs/faas';
import { Provide } from '@midwayjs/decorator';

@Provide()
export class Index {

  @Inject()
  ctx: Context;

  @ServerlessTrigger(...)
	async handler() {
    // 下面两种写法相同
		// this.ctx.body = 'hello world';
    return 'hello world';
	}
}
```

## Context

每次函数调用，都会创建一个全新的 ctx（函数上下文）。针对 ctx 上的属性或者方法，我们提供 ts 定义。

:::info
在 Serverless v1 时代，我们的定义叫 FaaSContext，在 v2 我们将定义和应用做了统一，更为一致。
:::

### ctx.logger

- return `ILogger`

运行时传递下来的每次请求的日志对象，默认为 console。

```typescript
ctx.logger.info('hello');
ctx.logger.warn('hello');
ctx.logger.error('hello');
```

### ctx.env

- return `string`

当前启动的环境，即 NODE_ENV 或者 MIDWAY_SERVER_ENV 的值，默认为 prod。

```typescript
ctx.env; // 默认 prod
```

### ctx.requestContext

- return `MidwayRequestContainer`

midway faas 的 IoC 请求作用域容器，用于获取其他 IoC 容器中的对象实例。

```typescript
const userService = await ctx.requestContext.getAsync('userService');
```

## FaaSHTTPContext

`Context`  定义继承于 `FaaSHTTPContext` ，前者保留了后者，大部分场景下可以直接使用前者，后者是在   apigw（API 网关）和 http （阿里云）触发器下才有的能力。

对于普通用户，直接使用 `Context`  定义即可。

```typescript
import { Context } from '@midwayjs/faas';

@Inject()
ctx: Context;
```

在 ctx 对象中，我们提供了一些和编写传统 Koa Web 应用程序类似的 API。这样的好处是减少用户的认知成本，并且，在一定程度上，兼容原有传统代码，兼容社区 middleware 成为了可能。

我们提供了一些和传统类似的 API，支持常用的能力，**在不同的平台可能不一定完全相同**，我们会在特定 API 中指出。

### ctx.request

- return `FaaSHTTPRequest`

FaaS 模拟的 HTTP Request 对象。

### ctx.response

- return `FaaSHTTPResponse`

FaaS 模拟的 HTTP Response 对象。

### ctx.params

代理自 `request.pathParameters` ，在 http 触发器（阿里云）和 API 网关触发器下可用。

```typescript
// /api/user/[id]   /api/user/faas
ctx.params.id; // faas
```

### ctx.set

设置响应头，此方法代理自 `response.setHeader` 。

```typescript
ctx.set('X-FaaS-Duration', 2100);
```

### ctx.status

设置返回状态码，此属性代理自 `response.statusCode` 。

```typescript
ctx.status = 404;
```

###

### Request aliases

以下列出的属性是从  [Request](#k6AZp)  对象代理过来

- `ctx.headers`
- `ctx.method`
- `ctx.url`
- `ctx.path`
- `ctx.ip`
- `ctx.query`
- `ctx.get()`

### Response aliases

以下列出的属性是从 [Response](#kfTOD) 对象代理过来

- `ctx.body=`
- `ctx.status=` alias to `response.statusCode`
- `ctx.type=`
- `ctx.set()` alias to `response.setHeader`

##

## FaaSHTTPRequest

此对象是通过将函数的 `event`  和 `context`  入参进行转换得来。

### request.headers

包含所有请求头的对象，键值对存储。

### request.ip

获取客户端请求 ip。

:::info
在阿里云 FC 上，只有 HTTP 触发器能获取到值，api 网关暂时无法获取。
:::

### request.url

客户端请求完整 url。

### request.path

客户端请求 path。

### request.method

请求的 method。

### request.body

POST 请求的 body，已经解析为 JSON。

## FaaSHTTPResponse

此对象是通过将函数的 `event` 和 `context` 入参进行转换得来。

### response.setHeader

设置响应头。

### response.statusCode

设置返回状态码。

### response.body

设置返回响应体内容， `string`  或者 `buffer` 。
