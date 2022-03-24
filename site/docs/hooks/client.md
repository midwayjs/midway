---
title: 前端请求客户端
---

在 Midway Hooks 的全栈应用中，我们使用 `@midwayjs/rpc` 作为默认的请求客户端。所有生成的接口都会通过 `@midwayjs/rpc` 来调用服务端。

## 配置

`@midwayjs/rpc` 提供了 `setupHttpClient` 方法来配置请求客户端（📢 `setupHttpClient` 应放置于前端代码的入口处。）。

支持的配置项如下：

```ts
type SetupOptions = {
  baseURL?: string;
  withCredentials?: boolean;
  fetcher?: Fetcher;
  middleware?: Middleware[];
};

type Fetcher = (
  req: HttpRequestOptions,
  options: SetupOptions
) => Promise<any>;

type Middleware = (
  ctx: Context,
  next: () => Promise<any>
) => void;

type Context = {
  req: HttpRequestOptions;
  res: any;
};

type HttpRequestOptions = {
  url: string;
  method: HttpMethod;
  data?: {
    args: any[];
  };

  // query & headers
  query?: Record<string, string>;
  headers?: Record<string, string>;
};
```

### baseURL: string

设置请求的基础 URL，默认为 `/`。

```ts
import { setupHttpClient } from '@midwayjs/rpc';

setupHttpClient({
  baseURL:
    process.env.NODE_ENV ===
    'development'
      ? 'http://localhost:7001'
      : 'https://api.example.com',
});
```

### withCredentials: boolean

默认为 `false`。具体可参考：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials)

```ts
import { setupHttpClient } from '@midwayjs/rpc';

setupHttpClient({
  withCredentials: true,
});
```

### fetcher: Fetcher

`@midwayjs/rpc` 默认使用 [redaxios](https://github.com/developit/redaxios) 作为请求客户端，一个遵循 axios api 的 mini 客户端。

通过设置 `fetcher`，可以替换默认的请求客户端。此处以使用 `axios` 作为默认的请求客户端为例。

```ts
import axios from 'axios';
import { setupHttpClient } from '@midwayjs/rpc';
import type { Fetcher } from '@midwayjs/rpc';

const fetcher: Fetcher = async (
  req,
  options
) => {
  const response = await axios({
    method: req.method,
    url: req.url,
    data: req.data,
    params: req.query,
    headers: req.headers,
    baseURL: options.baseURL,
    withCredentials:
      options.withCredentials,
  });
  return response.data;
};

setupHttpClient({ fetcher });
```

### middleware: Middleware[]

在 `@midwayjs/rpc` 中，我们可以设置中间件来用于打印参数，返回值处理错误等。

以打印当前请求的地址与返回值为例：

```ts
import { setupHttpClient } from '@midwayjs/rpc';
import type { Middleware } from '@midwayjs/rpc';

const logger: Middleware = async (
  ctx,
  next
) => {
  console.log(`<-- ${ctx.req.url}`);
  await next();
  console.log(
    `--> ${ctx.req.url} ${ctx.res}`
  );
};

setupHttpClient({
  middleware: [logger],
});
```

你也可以用于统一处理错误：

使用默认 `fetcher` 的情况下，`err` 类型参考：[Axios Response Schema](https://axios-http.com/docs/res_schema)。

```ts
import { setupHttpClient } from '@midwayjs/rpc';
import type { Middleware } from '@midwayjs/rpc';

const ErrorHandler: Middleware = async (
  ctx,
  next
) => {
  try {
    await next();
  } catch (err) {
    switch (err.status) {
      case 401:
        location.href = '/login';
        break;
      case 500:
        alert('Internal Server Error');
        break;
      default:
        alert(
          `Unknown Error, status: ${err.status}`
        );
        break;
    }
  }
};

setupHttpClient({
  middleware: [ErrorHandler],
});
```
