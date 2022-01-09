---
title: 从 Midway v1 升级到 v2
---

## 手动迁移步骤

### 1、midway 版本修改

将原来的 `midway`  依赖替换为下列依赖。

```typescript
 "dependencies": {
    "@midwayjs/bootstrap": "^2.3.0",
    "@midwayjs/decorator": "^2.3.0",
    "@midwayjs/web": "^2.3.0",
    "midway": "^2.3.0"
  },
```

:::info
`midway`  库为 v1 的兼容导出包。
:::

### 2、开发期依赖修改

- `**@midwayjs/mock**`  2.x 本地开发的测试库
- `**@types/jest**` 2.x 将 mocha 升级为了 jest，这是 jest 定义库
- **`@types/node`**  node 定义库，如有，可以升级
- **`cross-env`**  跨平台的代码执行库，如有，可升级
- **`@midwayjs/egg-ts-helper`** ，egg 定义生成工具，2.x 新加
- **`@midwayjs/cli`**  2.x 将原来的 midway-bin 工具升级为了 @midwayjs/cli 工具，命令不变，依旧是 midway-bin
- **`mwts`** Midway 2.x lint 规则库
- **`typescript`** ts 库，可升级

整体如下：

```json
  "devDependencies": {
    "@midwayjs/mock": "^2.3.0",
    "@types/jest": "^26.0.10",
    "@types/node": "14",
    "cross-env": "^6.0.0",
    "@midwayjs/egg-ts-helper": "^1.0.1",
    "@midwayjs/cli": "^1.0.0",
    "mwts": "^1.0.5",
    "typescript": "^3.9.0"
  },
```

:::info
注意，请移除 midway-bin 的包依赖。
:::

**脚本部分**
基本只是调整了 lint 的部分，移除了 debug 命令。

```json
  "scripts": {
    "start": "egg-scripts start --daemon --title=midway-server-midway_project --framework=midway",
    "stop": "egg-scripts stop --title=midway-server-midway_project",
    "start_build": "npm run build && cross-env NODE_ENV=development midway-bin dev",
    "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts",
    "test": "midway-bin test",
    "cov": "midway-bin cov",
    "lint": "mwts check",
    "lint:fix": "mwts fix",
    "ci": "npm run cov",
    "build": "midway-bin build -c"
  },
```

现在 debug 变成了每个命令的参数，你可以在 dev 或者其他命令时增加 `--debug`  参数来开启调试。

```json
{
  "debug": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts --debug"
}
```

更多调试场景，请参考 [调试文档](debugger)。

### 3、src 代码的修改

- 暂无

### 4、测试代码的修改

Midway v2 版本开始，默认的单测框架将由 mocha 迁移至 jest。

**方案**

jest 提供了 [codemod](https://github.com/skovhus/jest-codemods) 工具用于快速迁移。

```bash
npx jest-codemods
```

**手动修改**

- jest 中，全局的方法为 `beforeAll` ， `afterAll` ，而 mocha 为 `before` 和 `after`

## 可选调整

### Midway 代理 Egg 的定义变更（可选）

原有 Midway 代理了一部分 EggJS 定义，在新版本 Midway 中，提供了更为明确的定义，老的定义，我们依旧在 `midway` 这个包上进行兼容，但是我们希望新编写的代码逐步使用新的定义。

**旧写法**

```typescript
import { Context, EggAppConfig, EggApplication, Service } from 'midway';
```

**新写法**

```typescript
import { Context, EggAppConfig, EggApplication, Service } from 'egg';
```

涉及到的定义如下

| **旧写法**                                    | **新写法**                                    |
| --------------------------------------------- | --------------------------------------------- |
| import { Context } from 'midway'              | import { Context } from 'egg'                 |
| import { IContextLocals } from 'midway'       | import { IContextLocals } from 'egg'          |
| import { EggEnvType } from 'midway'           | import { EggEnvType } from 'egg'              |
| import { IEggPluginItem } from 'midway'       | import { IEggPluginItem } from 'egg'          |
| import { EggPlugin } from 'midway'            | import { EggPlugin } from 'egg'               |
| import { PowerPartial } from 'midway'         | import { PowerPartial } from 'egg'            |
| import { EggAppConfig } from 'midway'         | import { EggAppConfig } from 'egg'            |
| import { FileStream } from 'midway'           | import { FileStream } from 'egg'              |
| import { IApplicationLocals } from 'midway'   | import { IApplicationLocals } from 'egg'      |
| import { EggApplication } from 'midway'       | import { EggApplication } from 'egg'          |
| import { EggAppInfo } from 'midway'           | import { EggAppInfo } from 'egg'              |
| import { EggHttpClient } from 'midway'        | import { EggHttpClient } from 'egg'           |
| import { EggContextHttpClient } from 'midway' | import { EggContextHttpClient } from 'egg'    |
| import { Request } from 'midway'              | import { Request } from 'egg'                 |
| import { Response } from 'midway'             | import { Response } from 'egg'                |
| import { Router } from 'midway'               | import { Router } from 'egg'                  |
| import { Service } from 'midway'              | import { Service } from 'egg'                 |
| import { Boot } from 'midway'                 | import { Boot } from 'egg'                    |
| import { IBoot } from 'midway'                | import { IBoot } from 'egg'                   |
| import { IgnoreOrMatch } from 'midway'        | import { IgnoreOrMatch } from 'egg'           |
|                                               |                                               |
| import { EggLoggerLevel } from 'midway'       | import { **LoggerLevel** } from 'egg-logger'  |
| import { EggLogger } from 'midway'            | import { EggLogger } from 'egg-logger'        |
| import { EggLoggers } from 'midway'           | import { EggLoggers } from 'egg-logger'       |
| import { EggContextLogger } from 'midway'     | import { EggContextLogger } from 'egg-logger' |
|                                               |                                               |

### 中间件定义调整（可选）

**旧写法**

```typescript
import { provide, KoaMiddleware, Context } from 'midway';

@provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve(): KoaMiddleware {
    return async (ctx: any, next: () => Promise<any>) => {
      const startTime = Date.now();
      await next();
      console.log(Date.now() - startTime));
    };
  }

}
```

**新写法**

```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      const startTime = Date.now();
      await next();
      console.log(Date.now() - startTime));
    };
  }

}
```

### 装饰器变更调整（可选）

主要是大小写的变化。原有的小写装饰器为了兼容继续从 `midway`  包上导出，大写装饰器将从 `@midwayjs/decorator`  中导出。

**旧写法**

```typescript
import { provide, plugin, inject, get, controller } from 'midway';
```

新写法

```typescript
import { Provide, Plugin, Inject, Get, Controller } from '@midwayjs/decorator';
```

### providerWrapper 导出位置变更（可选）

**旧写法**

```typescript
export { providerWrapper } from 'midway';
```

**新写法**

```typescript
export { providerWrapper } from '@midwayjs/core';
```

### 启动命令的调整（可选）

虽然 `midway`  包依旧可用，但是我们建议您将启动框架修改为 `@midwayjs/web` 。

```typescript
  "scripts": {
    "start": "egg-scripts start xxxxxx --framework=midway",							// 老写法
    "start": "egg-scripts start xxxxxx --framework=@midwayjs/web"				// 新写法
  },
```

### 部署

:::caution
注意：我们不再支持内置文件的启动方式，即 `require('midway/server')`  来启动 midway 的用法。也不再支持 `midway-server-options`  这个选项。
:::

如有需要，请修改为我们新版本的 bootstrap 部署方式（支持单进程，支持 pm2）。

## Midway 升级变更速查表

这里只列出 v1 到 v2 对用户代码层面变更的部分，不含新增的能力。

|                | 描述 | 是否兼容 |
| -------------- | ---- | -------- |
| **框架变更项** |      |          |
| 包版本的变化   |

- midway -> 2
  | √  |
  | 包的变化 |
- midway-bin -> @midwayjs/cli
- midway-mock -> @midwayjs/mock
- @types/mocha -> @types/jest
  | 部分 |
  | 装饰器变为大写 | 从 midway 中导出继续兼容小写，现有装饰器都从 @midwayjs/decorator 导出 | √  |
  | egg 定义导出 | 先有的定义继续从 midway 导出，但是建议直接使用 egg 的定义 | √  |
  | container 的 loader 配置 | 转为 Configuration 的 imports 配置 | |
  | @Query，@Body，@Headers，@Session，@Param 装饰器空参数的行为变更 | 如果入参为空，则返回整个原始对象，而在 v2 版本中，行为做了调整，会根据当前的属性名获取对应的值 | |
  | | | |
  | **测试部分变更项** | | |
  | mocha 默认变更为 jest | 默认测试框架变更，方法相应有变化，before 变为 beforeAll，after 变为 afterAll，其他的 only 等方法的作用域有区别 | |
  | | | |
  | **部署部分变更项** | | |
  | egg-scripts 的启动命令 | 框架部分从 midway 变为 @midwayjs/web | √  |
  | require('midway/server')的方式 | 移除，不再支持 | |
  | midway-server-options 选项 | 移除，不再支持 | |

## 最后

在将定义导出迁移到新的方式之后，请移除 `midway`  包的依赖。
