---
title: Hooks
---

Midway Hooks 可以通过使用 `Hooks` 函数来获取运行时上下文。

## 语法

Hooks 需要在 Api 接口中使用。

有效的例子:

```ts
import {
  Api,
  Get,
  useContext,
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  console.log(ctx.method);
  // ...
});
```

无效例子：

```ts
import { useContext } from '@midwayjs/hooks';

const ctx = useContext(); // will throw error
```

## 支持的 Hooks

### useContext

`useContext()` 函数将返回本次请求相关的上下文，返回的 `Context` 与底层使用的框架决定。

以使用 [Koa](https://koajs.com/) 框架为例，那么 `useContext` 将返回 Koa 的 [Context](https://koajs.com/#context) 对象。

以获取请求 Method 和 Path 为例。

```ts
import {
  Api,
  Get,
  useContext,
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default Api(Get(), async () => {
  const ctx = useContext<Context>();
  return {
    method: ctx.method,
    path: ctx.path,
  };
});
```

你可以通过泛型来标注当前上下文的类型。

```ts
// Koa
import { Context } from '@midwayjs/koa';
const ctx = useContext<Context>();

// FaaS
import { Context } from '@midwayjs/faas';
const ctx = useContext<Context>();
```

## 创建可复用的 Hooks

你可以创建可复用的 Hooks，以便在多个接口中使用。

```ts
import {
  Api,
  Get,
  useContext,
} from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

function useIp() {
  const ctx = useContext<Context>();
  return ctx.ip;
}

export default Api(Get(), async () => {
  const ip = useIp();
  return {
    ip,
  };
});
```

一体化调用：

```ts
import getIp from './api';
const { ip } = await getIp();
console.log(ip); // 127.0.0.1
```
