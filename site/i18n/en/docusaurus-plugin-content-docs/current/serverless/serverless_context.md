# Function Context

## Event conversion

Midway Serverless has carried out input parameter wrapping according to the situation of different platforms. At the same time, when the function uses apigw(API gateway) and http (Aliyun) triggers, it has made special treatment on the input parameter (event). In order to simplify and unify the writing method, the event is unified and regularized into code similar to koa writing method.

Normal trigger scenario:

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

HTTP and API gateway trigger scenarios:

```typescript
import { Context } from '@midwayjs/faas';
import { Provide } from '@midwayjs/decorator';

@Provide()
export class Index {

  @Inject()
  ctx: Context;

  @ServerlessTrigger(...)
	async handler() {
    // The following two writing methods are the same
		// this.ctx.body = 'hello world';
    return 'hello world';
	}
}
```

## Context

Every time a function is called, a new ctx (function context) is created. For attributes or methods on ctx, we provide ts definitions.

:::info
In Serverless v1 era, our definition is called FaaSContext. In v2, we have unified the definition and application, which is more consistent.
:::

### ctx.logger

- return `ILogger`

The log object of each request passed by the runtime. The default value is console.

```typescript
ctx.logger.info('hello');
ctx.logger.warn('hello');
ctx.logger.error('hello');
```

### ctx.env

- return `string`

The current startup environment, that is, the value of the NODE_ENV or MIDWAY_SERVER_ENV. The default value is prod.

```typescript
ctx.env; //default prod
```

### ctx.requestContext

- return `MidwayRequestContainer`

The IoC request scope container of midway faas is used to obtain object instances in other IoC containers.

```typescript
const userService = await ctx.requestContext.getAsync(UserService);
```

## FaaSHTTPContext

`Context` definitions are inherited from `FaaSHTTPContext`. The former retains the latter. In most scenarios, the former can be used directly. The latter is only available under apigw(API Gateway) and http (Aliyun) triggers.

For ordinary users, just use `Context` definition directly.

```typescript
import { Context } from '@midwayjs/faas';

@Inject()
ctx: Context;
```

In the ctx object, we provide some API similar to writing traditional Koa Web applications. The advantage of this is to reduce the cognitive cost of users, and, to a certain extent, compatibility with the original traditional code and community middleware becomes possible.

We have provided some APIs similar to traditional APIs that support common capabilities. **Different platforms may not be exactly the same**. We will point out specific APIs.

### ctx.request

- return `FaaSHTTPRequest`

HTTP Request object simulated by FaaS.

### ctx.response

- return `FaaSHTTPResponse`

HTTP Response object simulated by FaaS.

### **ctx.params**

The proxy is `request.pathParameters` and is available under http triggers (Aliyun) and API gateway triggers.

```typescript
// /api/user/[id] /api/user/faas
ctx.params.id; // faas
```

### ctx.set

Set the response header, which is the `response.setHeader` agent.

```typescript
ctx.set('X-FaaS-Duration', 2100);
```

### ctx.status

Sets the return status code, which represents the `response.statusCode` from.

```typescript
ctx.status = 404;
```



### Request aliases

The attributes listed below are from the [Request](# k6AZp) object proxy

- `ctx.headers`
- `ctx.method`
- `ctx.url`
- `ctx.path`
- `ctx.ip`
- `ctx.query`
- `ctx.get()`

### Response aliases

The attributes listed below are from the [Response](#kfTOD) object proxy

- `ctx.body=`
- `ctx.status=` alias to `response.statusCode`
- `ctx.type=`
- `ctx.set()` alias to `response.setHeader`



## FaaSHTTPRequest

This object is obtained by converting the `event` and `context` input parameters of the function.

### request.headers

Object containing all request headers, key-value pair storage.

### request.ip

obtain the client request ip address.

:::info
On Alibaba Cloud FC, only the HTTP trigger can obtain the value, and the api gateway cannot obtain the value for the time being.
:::

### request.url

the client requests the complete url.

### request.path

the client request path.

### request.method

The requested method.

### request.body

The body of the POST request has been parsed to JSON.

## FaaSHTTPResponse

This object is obtained by converting the `event` and `context` input parameters of the function.

### response.setHeader

Set the response header.

### response.statusCode

Set the return status code.

### response.body

Set the content of the response body, `string` or `buffer`.
