---
title: 使用 Midway 组件
---

Midway 提供了一系列的组件，包含 Cache / Http / Redis 等。
而在 Midway Hooks 中，我们可以直接使用 Midway 组件，来快速实现功能。

## 引入组件

Midway Hooks 在 `configuration.ts` 中使用 `createConfiguration()` 来配置项目，其 Api 与 `@midwayjs/decorator` 提供的 `@Configuration()` 一致。

以 `@midwayjs/cache` 组件为例：

```ts
import {
  createConfiguration,
  hooks,
} from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import { join } from 'path';
import * as cache from '@midwayjs/cache';

export default createConfiguration({
  imports: [cache, Koa, Hooks()],
  importConfigs: [
    join(__dirname, 'config'),
  ],
});
```

你可以通过 `imports` 来导入组件，`importConfigs` 来导入配置文件。

## 使用组件

在 `@midwayjs/cache` 中，提供了 `CacheManager` 类来操作缓存。

在 Midway Hooks 中，你可以通过 `@midwayjs/hooks` 提供的 `useInject(class)` 来在运行时获取类的实例。

```ts
import {
  Api,
  Get,
  useInject,
} from '@midwayjs/hooks';
import { CacheManager } from '@midwayjs/cache';

export default Api(Get(), async () => {
  const cache = await useInject(
    CacheManager
  );

  await cache.set('name', 'Midway');
  const result = await cache.get(
    `name`
  );

  return `Hello ${result}!`;
});
```

这里的 `useInject(CacheManager)` 与 `@Inject() cache: CacheManager` 的功能是一致的。
