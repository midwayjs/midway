# API Development

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Routing

In Midway Hooks, you can quickly create interfaces through the `Api()` function provided by `@midwayjs/hooks`.

Hello World example:

```ts title="/src/hello.ts"
import {
  Api
  Get
} from '@midwayjs/hooks';

export default Api (
  Get(), // Http Path: /api/hello
  async () => {
    return 'Hello World!';
  }
);
```

An API interface consists of the following parts:

- `Api()`: defines an API function.
- `Get(path?: String)`: specifies the Http trigger, the request method is set to GET, and the optional `path` is the path of the interface. If you do not specify a path, the path is generated based on the `function name and file name`. By default, the path is prefixed with `/API`.
- `Handler: async (...args: any[]) => { ... }`: user logic, processes requests and returns results

You can also specify the path, as shown in the following example.

```ts title="/src/hello.ts"
import {
  Api
  Get
} from '@midwayjs/hooks';

export default Api (
  Get('/hello'), // Http Path: /hello
  async () => {
    return 'Hello World!';
  }
);
```

## Request context (Context / Request / Response)

You can get the request context object through the `useContext` provided by `@midwayjs/hooks`.

Taking [Koa](https://koajs.com/) framework as an example, the `useContext` will return Koa's [Context](https://koajs.com/#context) object.

Basic example:

1. Get the request Method and Path

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  return {
    method: ctx.method
    path: ctx.path
  };
});
```

2. Set the returned Header

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  ctx.set('X-Powered-By', 'Midway');
  return 'Hello World!';
});
```

At the same time, we can also set Header by `SetHeader()`.

## Http trigger

| Trigger | Notes |
| ------------------------ | --------------------------- |
| `All(path?: string)` | Accept all Http Method requests |
| `Get(path?: string)` | Accept GET request |
| `Post(path?: string)` | Accept POST request |
| `Put(path?: string)` | Accept PUT request |
| `Delete(path?: string)` | Accept DELETE request |
| `Patch(path?: string)` | Accept PATCH request |
| `Head(path?: string)` | Accept HEAD request |
| `Options(path?: string)` | Accept OPTIONS request |

## Request

### Pass parameter Data

In Midway Hooks, the input parameter of the interface is the parameter that declares the function.

The basic example is as follows:

```ts
import {
  Api
  Post
} from '@midwayjs/hooks';

export default Api (
  Post(), // Http Path: /api/say
  async (name: string) => {
    return 'Hello ${name}!';
  }
);
```

You can call the interface in two ways.

1. Full stack project: based on zero Api, import interface and call
2. Manual call: Use fetch to `Handler(...args: any[])` input parameters under Http, and you can pass parameters by setting the args parameter of Http Body during manual request.

<Tabs>
<TabItem value="fullstack" label="全栈应用（零 Api）">

```ts
import say from './api';

const response = await say('Midway');
console.log(response); // Hello Midway!
```

</TabItem>

<TabItem value="mannual" label="手动调用">

```ts
fetch('/api/say', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    args: ['Midway']
  }),
})
  .then((res) => res.text())
  .then((res) => console.log(res)); // Hello Midway!
```

</TabItem>
</Tabs>

### Query parameter Query

You can use the `Query<T>` parameter to pass the parameter to the URL.

If you want the interface path to be `/articles? Page = 0 & limit = 10`, you can write like this.

```ts
import {
  Api
  Get
  Query
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get()
  Query< {
    page: string;
    limit: string;
  }>(),
  async () => {
    const ctx = useContext();
    return {
      page: ctx.query.page
      limit: ctx.query.limit
    };
  }
);
```

Front-end call

<Tabs>
<TabItem value="fullstack" label="全栈应用">

```ts
import getArticles from './api';
const response = await getArticles({
  query: { page: '0', limit: '10'}
});
console.log(response); // { page: '0', limit: '10'}
```

</TabItem>

<TabItem value="mannual" label="手动调用">

```ts
fetch('/api/articles?page=0&limit=10')
  .then((res) => res.json())
  .then((res) => console.log(res)); // { page: '0', limit: '10'}
```

</TabItem>
</Tabs>

### Path parameter Params

Path parameters can realize the functions of dynamic paths and obtaining parameters from paths. When you use this feature, you must manually set the path and use `Params<T>` to declare the type.

If you want the interface path to be `/article/100` and get a value with id `100`, you can write as follows:

```ts
import {
  Api
  Get
  Params
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get('/article/:id')
  Params<{ id: string }>()
  async () => {
    const ctx = useContext();
    return {
      article: ctx.params.id
    };
  }
);
```

Front-end call

<Tabs>
<TabItem value="fullstack" label="全栈应用">

```ts
import getArticle from './api/article';
const response = await getArticle({
  params: { id: '100'}
});
console.log(response); // { article: '100'}
```

</TabItem>

<TabItem value="mannual" label="手动调用">

```ts
fetch('/article/100')
  .then((res) => res.json())
  .then((res) => console.log(res)); // { article: '100'}
```

</TabItem>
</Tabs>

### Request header Headers

The request header can realize the function of passing parameters through Http Headers. When using this function, the type must be declared by `Headers<T>`.

If you want to request `/auth` and pass token in the `Request Headers`, you can write as follows:

```ts
import {
  Api
  Get
  Headers
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get('/auth')
  Headers<{ token: string }>()
  async () => {
    const ctx = useContext();
    return {
      token: ctx.headers.token
    };
  }
);
```

Front-end call

<Tabs>
<TabItem value="fullstack" label="全栈应用">

```ts
import getAuth from './api/auth';
const response = await getAuth({
  headers: { token: '123456'}
});
console.log(response); // { token: '123456'}
```

</TabItem>

<TabItem value="mannual" label="手动调用">

```ts
fetch('/auth', {
  headers: {
    token: '123456',
  },
})
  .then((res) => res.json())
  .then((res) => console.log(res)); // { token: '123456'}
```

</TabItem>
</Tabs>

## Response Response

### Status code HttpCode

`HttpCode(status: number)` is supported.

<Tabs>
<TabItem value="operator" label="SetHeader">

```ts
import {
  Api
  Get
  HttpCode
} from '@midwayjs/hooks';

export default Api (
  Get()
  HttpCode(201)
  async () => {
    return 'Hello World!';
  }
);
```

</TabItem>

<TabItem value="mannual" label="手动设置">

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  ctx.status = 201;
  return 'Hello World!';
});
```

</TabItem>
</Tabs>

### Response header SetHeader

`SetHeader(key: string, value: string)`

<Tabs>
<TabItem value="operator" label="SetHeader">

```ts
import {
  Api
  Get
  SetHeader
} from '@midwayjs/hooks';

export default Api (
  Get()
  SetHeader('X-Powered-By', 'Midway')
  async () => {
    return 'Hello World!';
  }
);
```

</TabItem>

<TabItem value="mannual" label="手动设置">

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  ctx.set('X-Powered-By', 'Midway');
  return 'Hello World!';
});
```

</TabItem>
</Tabs>

### Redirect Redirect

Support: `Redirect(url: string, code?: number = 302)`

<Tabs>
<TabItem value="operator" label="Redirect">

```ts
import {
  Api
  Get
  Redirect
} from '@midwayjs/hooks';

export default Api (
  Get('/demo')
  Redirect('/hello')
  async () => {}
);
```

</TabItem>

<TabItem value="mannual" label="手动设置">

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get('/demo')
  async () => {
    const ctx = useContext<Context>();
    ctx.redirect('/hello');
  }
);
```

</TabItem>
</Tabs>

### Return value type ContentType

Supported: `ContentType(type: string)`.

<Tabs>
<TabItem value="operator" label="ContentType">

```ts
import {
  Api
  Get
  ContentType
} from '@midwayjs/hooks';

export default Api (
  Get()
  ContentType('text/html')
  async () => {
    return '<h1>Hello World! </h1>';
  }
);
```

</TabItem>

<TabItem value="mannual" label="手动设置">

```ts
import {
  Api
  Get
  ContentType
} from '@midwayjs/hooks';

export default Api (
  Get()
  ContentType('text/html')
  async () => {
    return '<h1>Hello World! </h1>';
  }
);
```

</TabItem>
</Tabs>
