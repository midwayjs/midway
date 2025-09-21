
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 3.x 升级指南

本篇将介绍从 midway v3 升级为 midway v4 的方式。

从 Midway v3 升级到 Midway v4，会有一些 Breaking Change。本篇文档仅列出这些 Breaking 的地方，让用户可以提前知道变化，做出应对。



## Node.js 的变化

midway v4 支持从 node v20 起，最好使用 LTS 版本。




## 包版本更新

所有的组件包，核心包都将升级为 4.x 版本。

> 目前处于 beta 阶段

```diff
{
  "dependencies": {
-    "@midwayjs/bootstrap": "^3.0.0",
-    "@midwayjs/core": "^3.0.0",
-    "@midwayjs/koa": "^3.0.0",
-    "@midwayjs/logger": "^3.0.0",
+    "@midwayjs/bootstrap": "^4.0.0-beta.1",
+    "@midwayjs/core": "^4.0.0-beta.1",
+    "@midwayjs/koa": "^4.0.0-beta.1",
+    "@midwayjs/logger": "^4.0.0",
  },
  "devDependencies": {
-    "@midwayjs/mock": "^3.0.0",
+    "@midwayjs/mock": "^4.0.0-beta.1",
    // ...
  }
}

```

`@midwyajs/luckeye` 的版本除外。




## 移除 `@midwayjs/decorator`

从 v4 开始，移除了 `@midwayjs/decorator` 包，用户可以直接使用 `@midwayjs/core` 来代替。

```diff
- import { Controller } from '@midwayjs/decorator';
+ import { Controller } from '@midwayjs/core';
```






## 入口自动扫描能力

从 v4 开始，框架移除了隐式的自动扫描能力，用户需要显式的声明需要扫描的目录。

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector(),
  // ...
})
export class MainContainer {
  // ...
}
```

你也可以指定要忽略的目录。

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector({
    ignore: [
      '**/logs/**',
    ],
  }),
  // ...
})
export class MainContainer {
  // ...
}
```

重复检查配置也放到了参数中。

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector({
    conflictCheck: true,
  }),
  // ...
})
export class MainContainer {
  // ...
}
```





## 主框架日志配置

从 v4 开始，主框架日志格式回归到 midwayLogger 配置中。

<Tabs>
<TabItem value="koa" label="Koa">

```diff
// *.config.ts
export default {
  koa: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="express" label="Express">

```diff
// *.config.ts
export default {
  express: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="egg" label="Egg">

```diff
// *.config.ts
export default {
  egg: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="bull" label="Bull">

```diff
// *.config.ts
export default {
  bull: {
-    contextLoggerFormat: info => {
-      const { jobId, from } = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      bullLogger: {
+        contextFormat: info => {
+          const { jobId, from } = info.ctx;
+          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;`;
+        }
      }
    }
  },
} as MidwayConfig;
```
</TabItem>

</Tabs>

其余的 `cron`、`mqtt`, `kafka` 等组件，如有相关配置，均和上述类似。



## 可选变更对照

以下是各个包的 Breaking Changes 对照表，按照包名分类展示具体的变更内容。

### @midwayjs/core

#### @App() 装饰器变更

使用 `@MainApp()` 代替 `@App()` 空参数的场景：

```diff
- @App()
+ @MainApp()
private app;
```

#### @Config() 装饰器变更

使用 `@AllConfig()` 替换 `@Config(ALL)` 的场景：

```diff
- @Config(ALL)
+ @AllConfig()
private allConfig;
```

#### DecoratorManager API 调整

`DecoratorManager` 中的 API 名称调整：

```diff
import { DecoratorManager } from '@midwayjs/core';

- DecoratorManager.listPrelaodModules()
+ DecoratorManager.listPreStartModule()

- DecoratorManager.savePreloadModule('xxxx', xxx)
+ DecoratorManager.savePreStartModule('xxxx', xxx)
```

#### @Configuration 参数变更

移除 `@Configuration` 中的 `conflictCheck` 和 `detectorOptions`，这些配置将移动到 `detector` 中：

```diff
@Configuration({
- conflictCheck: true,
- detectorOptions: { ... },
+ detector: new CommonJSFileDetector({
+   conflictCheck: true,
+   // ... 其他配置
+ }),
  // ...
})
```

#### Container API 简化

移除了 `container.get` 和 `container.getAsync` 的一部分无用的参数：

```diff
// 之前有额外的参数
- container.get(identifier, args, options)
+ container.get(identifier, args)

- container.getAsync(identifier, args, options)
+ container.getAsync(identifier, args)
```

#### Pipeline 流程控制移除

由于使用率较低且影响依赖注入容器逻辑，移除了流程控制 `Pipeline` 相关的能力：

```diff
- import { Pipeline } from '@midwayjs/core';
- 
- @Pipeline()
- export class MyPipeline {
-   // pipeline 相关代码
- }
```

如果需要类似功能，建议使用中间件或拦截器替代。

#### 自动 DTO 转换移除

移除了会和 validate 的转换产生歧义的请求参数自动 DTO 转换功能，现在自动转换仅在 `validate` 或者 `validation` 组件开启时生效：

```diff
// v3 中，即使没有开启 validate，也会自动转换
export class UserController {
  @Post()
  async create(@Body() user: CreateUserDTO) {
-   // v3: 自动转换为 CreateUserDTO 实例
+   // v4: 需要显式开启 validate 或 validation 组件才会转换
    return user;
  }
}

// v4 中需要显式配置
+ import { Configuration } from '@midwayjs/core';
+ import * as validate from '@midwayjs/validate'; // 或 @midwayjs/validation
+ 
+ @Configuration({
+   imports: [validate],
+ })
+ export class MainConfiguration {}
```

#### MidwayFrameworkType 移除

```diff
- import { MidwayFrameworkType } from '@midwayjs/core';
- 
- // 获取框架类型
- const frameworkType = app.getFrameworkType();
- if (frameworkType === MidwayFrameworkType.WEB_KOA) {
-   // koa 框架相关逻辑
- }
```

#### BaseFramework Hook 方法移除

```diff
export class CustomFramework extends BaseFramework {
- async beforeContainerReady() {
-   // 容器准备前的逻辑
- }
- 
- async afterContainerReady() {
-   // 容器准备后的逻辑
- }
}
```

#### DataSourceManager 配置废弃

```diff
// 数据源管理器配置
export const dataSourceConfig = {
- cacheInstance: true,
- validateConnection: true,
  // 其他配置保持不变
};
```

### @midwayjs/async-hooks-context-manager

#### 默认开启 async_local_storage

现在默认开启 async_local_storage，代码合并至 core 模块中，用户无需手动导入：

### @midwayjs/axios

#### axios 导出移除

移除了废弃的 `axios` 导出：

```diff
- import { axios } from '@midwayjs/axios';
+ import { HttpService } from '@midwayjs/axios';

export class UserService {
- @Inject()
- axios: axios;

+ @Inject()
+ httpService: HttpService;

  async getUser() {
-   return this.axios.get('/api/user');
+   return this.httpService.get('/api/user');
  }
}
```

### @midwayjs/socketio

#### 内置 socket.io-redis 移除

移除了内置的 `socket.io-redis`，如果需要 Redis 适配器，请手动安装和配置 `socket.io-redis`。

### @midwayjs/validate

不再更新，推荐使用 @midwayjs/validation 组件。

### @midwayjs/mock

#### createApp 方法参数调整

移除了 `createApp`，`createLightApp`, `createFunctionApp` 方法的最后一个参数，现在额外指定组件可以写到 `options.imports` 中：

```diff
- createApp('path', {}, ['extra-component'])
+ createApp('path', { imports: ['extra-component'] })
```

如果有大量历史测试不方便修改，可以使用提供的 `createLegacyApp`，`createLegacyLightApp`，`createLegacyFunctionApp`。

### @midwayjs/sequelize

#### @BaseTable 装饰器移除

```diff
- import { BaseTable } from '@midwayjs/sequelize';
- 
- @BaseTable()
- export class User extends Model {}

+ import { Table } from 'sequelize-typescript';
+ 
+ @Table
+ export class User extends Model {}
```

#### validateConnection 配置移除

```diff
// 配置文件
export default {
  sequelize: {
    dataSource: {
      default: {
        database: 'test',
        username: 'root',
        password: '',
-       validateConnection: true, // 默认不再校验连接
        // 如有需要可以手动开启
+       // validateConnection: true,
      }
    }
  }
}
```

### @midwayjs/tags

#### 包完全移除

此包在 v4 中不再提供，需要移除相关导入和配置：

```diff
- import * as tags from '@midwayjs/tags';
- 
- @Configuration({
-   imports: [
-     // 其他组件
-     tags,
-   ],
- })
- export class MainConfiguration {}
```

### @midwayjs/processAgent

#### 包完全移除

此包在 v4 中不再提供，需要移除相关导入和配置：

```diff
- import * as processAgent from '@midwayjs/processAgent';
- 
- @Configuration({
-   imports: [
-     // 其他组件
-     processAgent,
-   ],
- })
- export class MainConfiguration {}
```

