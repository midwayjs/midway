---
title: 运行环境
---

Node.js 应用一般通过 `NODE_ENV`  来获取环境变量，来满足不同环境下的不同需求。比如在 `production`  环境下，开启缓存，优化性能，而在 `development`  环境下，会打开所有的日志开关，输出详细的错误信息等等。

## 指定运行环境

由于在一些情况下 `NODE_ENV` 会被一些工具包拦截注入，所以在 Midway 体系下，我们会根据 `MIDWAY_SERVER_ENV` 优先获取环境，而 `NODE_ENV` 作为第二优先级获取。

我们可以通过启动时增加环境变量来指定。

```bash
MIDWAY_SERVER_ENV=prod npm start					// 第一优先级
NODE_ENV=local npm start									// 第二优先级
```

在 windows 环境，我们需要使用 [cross-env](https://www.npmjs.com/package/cross-env) 模块以达到同样的效果。

```bash
cross-env MIDWAY_SERVER_ENV=prod npm start					// 第一优先级
cross-env NODE_ENV=local npm start									// 第二优先级
```

## 代码中获取环境

Midway 在 app 对象上提供了 `getEnv()`  方法获取环境，面对不同的上层框架，Midway 都做了相应的处理，保使得在不同场景下，都拥有 `getEnv()`  方法。。

```typescript
import { Application } from 'egg';

// process.env.MIDWAY_SERVER_ENV=prod
@Provide()
export class UserService {
  @App()
  app: Application; // 请替换为使用的上层框架

  async invoke() {
    console.log(this.app.getEnv()); // prod
  }
}
```

如果 `NODE_ENV` 和 `MIDWAY_SERVER_ENV`  都没有赋值，那么默认情况下，方法的返回值为 `prod` 。

:::info
注意，你不能直接通过 `NODE_ENV` 和 `MIDWAY_SERVER_ENV` 来获取环境，这两个值都有可能为空，且 Midway 不会反向设置它。如需获取环境，请通过 app.getEnv() 获取其他框架提供的 API 方法获取。
:::

## 常见的环境变量值

一般来说，每个公司都有一些自己的环境变量值，下面是一些常见的环境变量值以及他们对应的说明。

| **值**                | **说明**     |     |
| --------------------- | ------------ | --- |
| local                 | 本地开发环境 |     |
| dev/daily/development | 日常开发环境 |     |
| pre/prepub            | 预生产环境   |     |
| prod/production       | 生产环境     |     |
| test/unittest         | 单元测试环境 |     |
| benchmark             | 性能测试环境 |     |

## 依赖注入容器中获取环境

在依赖注入容器初始化的过程中，Midway 默认初始化了一个 `EnvironmentService` 服务用来解析环境，并在整个生命周期中，持续保持这个服务对象。

借助服务的 `getCurrentEnvironment`  方法，我们可以直接从上面获取环境值，而 `app.getEnv()`  方法也正是这样获取值的。

```typescript
const environmentService = app.getApplicationContext().getEnvironmentService();
const env = environmentService.getCurrentEnvironment();
```
