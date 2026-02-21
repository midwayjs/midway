# 函数式 API

本页用于快速查询 `@midwayjs/core/functional` 当前可用的函数式 API。

## 配置与路由

最小目录示例：

```txt
src
├── server
│   ├── index.ts           # defineConfiguration 入口
│   └── api
│       └── user.api.ts    # defineApi 声明文件
└── web
    └── api
        └── client.ts
```

### `defineConfiguration`

- 作用：定义 Midway 函数式配置入口（替代 class `@Configuration`）
- 等同于原 class 写法：`@Configuration(...)` class

示例：

```ts
// src/server/index.ts
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';

export default defineConfiguration({
  imports: [koa],
});
```

### `defineApi`

- 作用：定义函数式 API 契约与路由（method/path/input/output/handle）
- 等同于原 class 写法：`@Controller(...)` + `@Get/@Post/...` + 方法实现

示例：

```ts
// src/server/api/user.api.ts
import { defineApi } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async ({ input }) => {
    return { id: input.params?.id, name: 'harry' };
  }),
}));
```

## Hooks

### `useContext`

- 作用：获取当前请求上下文
- 等同于原 class 写法：方法参数里直接使用 `@Context()`（或 `ctx` 入参）

示例：

```ts
// src/server/api/trace.api.ts
import { defineApi, useContext } from '@midwayjs/core/functional';

export const traceApi = defineApi('/trace', api => ({
  getTrace: api.get('/').handle(async () => {
    const ctx = useContext();
    return { traceId: ctx?.headers?.['x-trace-id'] };
  }),
}));
```

### `useLogger`

- 作用：获取当前上下文日志对象（或主应用 logger）
- 等同于原 class 写法：`@Logger()` 注入或使用 `ctx.logger`

示例：

```ts
// src/server/api/log.api.ts
import { defineApi, useLogger } from '@midwayjs/core/functional';

export const logApi = defineApi('/log', api => ({
  ping: api.get('/ping').handle(async () => {
    const logger = useLogger();
    logger.info('hello functional');
    return 'ok';
  }),
}));
```

### `usePlugin`

- 作用：从上下文或应用对象中获取插件能力
- 等同于原 class 写法：在 class 中通过 `ctx.app.xxx` / `this.app.xxx` 访问插件
- 说明：仅在 Egg 场景下使用，函数式常规场景不可用

示例：

```ts
// src/server/api/plugin.api.ts
import { defineApi, usePlugin } from '@midwayjs/core/functional';

export const pluginApi = defineApi('/plugin', api => ({
  info: api.get('/').handle(async () => {
    const cache = usePlugin('cache');
    return { hasCache: !!cache };
  }),
}));
```

### `useInject`

- 作用：异步获取 IoC 实例
- 等同于原 class 写法：`@Inject()` 属性注入后调用

示例：

```ts
// src/server/api/user.api.ts
import { defineApi, useInject } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';

export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async ({ input }) => {
    const userService = await useInject(UserService);
    return userService.find(input.params?.id);
  }),
}));
```

### `useInjectSync`

- 作用：同步获取 IoC 实例
- 等同于原 class 写法：`@Inject()` 注入已就绪实例并同步使用

示例：

```ts
// src/server/api/sync.api.ts
import { defineApi, useInjectSync } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';

export const syncApi = defineApi('/sync', api => ({
  get: api.get('/').handle(async () => {
    const userService = useInjectSync(UserService);
    return userService.findSync?.('u-1');
  }),
}));
```

### `useConfig`

- 作用：读取配置
- 等同于原 class 写法：`@Config()` 注入配置

示例：

```ts
// src/server/api/config.api.ts
import { defineApi, useConfig } from '@midwayjs/core/functional';

export const configApi = defineApi('/config', api => ({
  get: api.get('/').handle(async () => {
    const redisConfig = useConfig('redis');
    return { redisConfig };
  }),
}));
```

### `useApp`

- 作用：按名称获取应用实例
- 等同于原 class 写法：在框架类/上下文里按 appName 取应用实例

示例：

```ts
// src/server/api/app.api.ts
import { defineApi, useApp } from '@midwayjs/core/functional';

export const appApi = defineApi('/app', api => ({
  info: api.get('/').handle(async () => {
    const koaApp = useApp('koa');
    return { appName: koaApp?.getFrameworkName?.() };
  }),
}));
```

### `useMainApp`

- 作用：获取主应用实例
- 等同于原 class 写法：在 class 场景中直接拿主应用对象（app）

示例：

```ts
// src/server/api/main.api.ts
import { defineApi, useMainApp } from '@midwayjs/core/functional';

export const mainApi = defineApi('/main', api => ({
  info: api.get('/').handle(async () => {
    const app = useMainApp();
    return { hasApp: !!app };
  }),
}));
```

### `useInjectClient`

- 作用：从 `IServiceFactory` 获取客户端实例
- 等同于原 class 写法：注入 `IServiceFactory` 后调用 `get(...)`

示例：

```ts
// src/server/api/client.api.ts
import { defineApi, useInjectClient } from '@midwayjs/core/functional';
import { HttpServiceFactory } from './httpServiceFactory'; // 示例类型

export const clientApi = defineApi('/client', api => ({
  get: api.get('/').handle(async () => {
    const client = await useInjectClient(HttpServiceFactory, 'default');
    return client.request?.('/ping');
  }),
}));
```

### `useInjectDataSource`

- 作用：从 `IDataSourceManager` 获取数据源实例
- 等同于原 class 写法：注入 `IDataSourceManager` 后调用 `getDataSource(...)`

示例：

```ts
// src/server/api/db.api.ts
import { defineApi, useInjectDataSource } from '@midwayjs/core/functional';
import { OrmDataSourceManager } from './ormDataSourceManager'; // 示例类型

export const dbApi = defineApi('/db', api => ({
  get: api.get('/').handle(async () => {
    const db = await useInjectDataSource(OrmDataSourceManager, 'default');
    return { connected: !!db };
  }),
}));
```
