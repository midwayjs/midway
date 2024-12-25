# Hooks

Midway Hooks can use the `Hooks` function to obtain the runtime context.

## Grammar

Hooks needs to be used in the Api interface.

Effective examples:

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  console.log(ctx.method);
  // ...
});
```

Invalid example:

```ts
import { useContext } from '@midwayjs/hooks';

const ctx = useContext(); // will throw error
```

## Hooks Supported

### useContext

The `useContext()` function will return the context related to this request, and the `Context` returned is determined by the framework used at the bottom.

Taking [Koa](https://koajs.com/) framework as an example, the `useContext` will return Koa's [Context](https://koajs.com/#context) object.

Take obtaining the request Method and Path as an example.

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

You can label the type of the current context by generics.

```ts
// Koa
import { Context } from '@midwayjs/koa';
const ctx = useContext<Context>();

// FaaS
import { Context } from '@midwayjs/faas';
const ctx = useContext<Context>();
```

## Create reusable Hooks

You can create reusable Hooks for use in multiple interfaces.

```ts
import {
  Api
  Get
  useContext
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

function useIp() {
  const ctx = useContext<Context>();
  return ctx.ip;
}

export default Api(Get(), async () => {
  const ip = useIp();
  return {
    ip
  };
});
```

Integrated call:

```ts
import getIp from './api';
const { ip } = await getIp();
console.log(ip); // 127.0.0.1
```
