# 函数式基础

这一章回答三个核心问题：

1. 函数式能力从哪里导出
2. 现有框架函数和 class 写法是什么关系
3. 为什么会演进出 `defineApi`

## 导出约定

函数式写法统一通过 `@midwayjs/core/functional` 及其子路径导出。

这里重点关注三类能力：

- 配置入口：`defineConfiguration`
- API 定义：`defineApi`
- Hooks：`useContext`、`useInject`、`useConfig`、`useLogger`（以及同类 `use*` 能力）

示例：

```ts
import {
  defineConfiguration,
  defineApi,
  useInject,
  useContext,
} from '@midwayjs/core/functional';
```

## 和 Class 写法的关系

函数式不是替代 class，而是同一套框架能力的另一种表达方式。

| Class 写法 | 函数式写法 | 作用 |
| --- | --- | --- |
| `@Configuration` class | `defineConfiguration(...)` | 定义应用入口配置、组件导入、运行时参数 |
| `@Controller` + `@Get/@Post` | `defineApi(...)` + `api.get/api.post` | 声明路由与 API 契约 |
| `@Inject()` | `useInject(...)` | 获取服务实例（IoC 注入） |
| `@Config()` / `ctx.logger` 等 | `useConfig(...)` / `useLogger(...)` / `useContext(...)` | 读取配置、日志与上下文能力 |

## 框架函数对比示例

### 配置入口对比

Class：

```ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa],
})
export class MainConfiguration {}
```

Functional：

```ts
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';

export default defineConfiguration({
  imports: [koa],
});
```

## 演进说明：为什么有 `defineApi`

当前函数式能力的重点是“和前端协同开发更顺滑”，所以引入了 `defineApi`：

- 把服务端 API 契约直接暴露给前端
- 前端可直接使用类型化 client 调用
- 减少手写 `method/path` 和联调偏差

### `defineApi` 与 class 路由对比

| 对比项 | Class 路由 | `defineApi` |
| --- | --- | --- |
| 组织方式 | Controller class + 方法 | 函数式对象声明 |
| 前端复用契约 | 通常需额外抽取 | 天然可复用 `src/server/api/*.api.ts` |
| 校验方式 | decorator + pipeline | `input/output` |
| 中间件绑定 | controller / method decorator | `controllerOptions.middleware` / `.meta({ middleware })` |

### 同一个项目如何选

- 需要和前端同仓协作：优先 `defineApi`
- 纯后端 API：`@Controller` 和 `defineApi` 都可
- 存量系统：可按模块渐进迁移，不需要一次替换
