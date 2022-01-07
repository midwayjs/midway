---
title: 内置 Hooks
---

## useContext

**​**

```typescript
const ctx = useContext();
```

`useContext` 可以用于获取当前请求的上下文。

Context 类型可以通过泛型注入，如：

```typescript
// Koa
import { Context } from '@midwayjs/koa';
const ctx = useContext<Context>();

// FaaS
import { Context } from '@midwayjs/faas';
const ctx = useContext<Context>();
```

### ctx.requestContext

Midway 的 IoC 请求上下文对象，具体文档可以参考：[使用依赖注入](https://www.yuque.com/midwayjs/faas/use_inject)

### ctx.logger

Midway   自带的 Logger 对象

## useInject

```typescript
function useInject<T = any>(identifier: any): Promise<T>;
```

useInject 是对 Midway IoC 依赖注入功能的封装，用于获取注入的实例，等同于 Class 里使用的 `@Inject` 装饰器与 [使用依赖注入](/docs/container) 文档中提到的 `getAsync` 方法。

> 示例

```typescript
import { useInject } from '@midwayjs/hooks';
import { Provide } from '@midwayjs/decorator';

export async function getModel() {
  const model = await useInject(Model);
  return model.name;
}

@Provide()
export class Model {
  name = 'model';
}
```

进一步的文档可以参考：[使用依赖注入](/docs/container)。

## useConfig

```typescript
const config = useConfig('key');
```

useConfig 可以用于获取业务配置。

业务配置的使用方式可以参考：[多环境配置](/docs/env_config)

:::caution
Midway Hooks 中，相关的函数文件默认存放于 `./src/apis/` 目录下。因此 config 与 configuration 所在的目录需为 `./src/apis/`（如修改了 midway.config.ts 的 source 字段，请使用修改后的目录）
:::

## useLogger

```typescript
const logger = useLogger();
```

`useLogger` 可以获取 `logger` 并输出日志。

输出日志：

```typescript
logger.debug();
logger.info();
logger.warn();
logger.error();
```

## usePlugin

用于获取 Egg 插件等。

```typescript
const plugin = usePlugin('pluginName');
```

> Demo：通过 [egg-sequelize](https://github.com/eggjs/egg-sequelize) 查询数据库

```typescript
import { usePlugin } from '@midwayjs/hooks';

export default async function getUserById(empId: number) {
  const sequelize = usePlugin('sequelize');
  console.log(sequelize);
}
```
