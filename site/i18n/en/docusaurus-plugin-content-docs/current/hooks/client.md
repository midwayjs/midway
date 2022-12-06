# Front-end request client

In Midway Hooks' full stack application, we use `@midwayjs/rpc` as the default request client. All generated interfaces call the server through `@midwayjs/rpc`.

## Configuration

`@midwayjs/rpc` provides `setupHttpClient` methods to configure the requesting client (📢The `setupHttpClient` should be placed at the entrance of the front-end code.).

The supported configuration items are as follows:

```ts
type SetupOptions = {
  baseURL?: string;
  withCredentials?: boolean;
  fetcher?: Fetcher;
  middleware?: Middleware[];
};

type Fetcher = (
  req: HttpRequestOptions
  options: SetupOptions
) => Promise<any>;

type Middleware = (
  ctx: Context
  next: () => Promise<any>
) => void;

type Context = {
  req: HttpRequestOptions;
  res: any;
};

type HttpRequestOptions = {
  url: string;
  method: HttpMethod;
  data ?: {
    args: any[];
  };

  // query & headers
  query?: Record<string, string>;
  headers?: Record<string, string>;
};
```

### baseURL: string

The basic URL of the request. Default value:`/`.

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

Default value: `false`. For more information, see [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials).

```ts
import { setupHttpClient } from '@midwayjs/rpc';

setupHttpClient({
  withCredentials: true
});
```

### fetcher: Fetcher

`@midwayjs/rpc` uses [redaxios](https://github.com/developit/redaxios) as the request client by default, a mini client that follows the axios api.

By setting the `fetcher`, you can replace the default requesting client. In this example, `axios` is used as the default request client.

```ts
import axios from 'axios';
import { setupHttpClient } from '@midwayjs/rpc';
import type { Fetcher } from '@midwayjs/rpc';

const fetcher: Fetcher = async (
  req
  options
) => {
  const response = await axios({
    method: req.method
    url: req.url
    data: req.data
    params: req.query
    headers: req.headers
    baseURL: options.baseURL
    withCredentials:
      options.withCredentials
  });
  return response.data;
};

setupHttpClient({ fetcher });
```

### middleware: Middleware []

In `@midwayjs/rpc`, we can set up middleware for printing parameters, return value handling errors, etc.

Take printing the address and return value of the current request as an example:

```ts
import { setupHttpClient } from '@midwayjs/rpc';
import type { Middleware } from '@midwayjs/rpc';

const logger: Middleware = async (
  ctx
  next
) => {
  console.log('<-- ${ctx.req.url}');
  await next();
  console.log (
    '--> ${ctx.req.url} ${ctx.res}'
  );
};

setupHttpClient({
  middleware: [logger]
});
```

You can also use it to handle errors uniformly:

When using the default `fetcher`, the `err` type refers to [Axios Response Schema](https://axios-http.com/docs/res_schema).

```ts
import { setupHttpClient } from '@midwayjs/rpc';
import type { Middleware } from '@midwayjs/rpc';

const ErrorHandler: Middleware = async (
  ctx
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
        alert (
          'Unknown Error, status: ${err.status}'
        );
        break;
    }
  }
};

setupHttpClient({
  middleware: [ErrorHandler]
});
```
