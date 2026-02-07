---
type: lesson
title: 理解中间件
focus: /src/middleware/logger.middleware.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---

# 中间件（Middleware）

中间件是 Web 应用中的核心概念，它可以在请求到达 Controller 之前或之后执行特定的逻辑。

## 什么是中间件？

想象一下，HTTP 请求就像一个包裹，需要经过多个检查站才能到达目的地（Controller）：

```
客户端请求 
  → 中间件1（日志记录）
  → 中间件2（身份验证）
  → 中间件3（参数验证）
  → Controller 处理
  → 中间件3（返回）
  → 中间件2（返回）
  → 中间件1（返回）
  → 客户端响应
```

## 中间件的作用

中间件常用于以下场景：

- 🔐 **身份验证** - 检查用户登录状态
- 📝 **日志记录** - 记录请求和响应信息
- ⚡ **性能监控** - 统计接口响应时间
- 🛡️ **安全防护** - CORS、XSS 防护等
- 🔄 **数据转换** - 请求/响应数据格式转换
- ⏱️ **请求限流** - 防止 API 被滥用

## 创建第一个中间件

让我们创建一个简单的日志中间件。

创建 `src/middleware/logger.middleware.ts`：

```typescript
import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class LoggerMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 请求开始时间
      const startTime = Date.now();

      // 记录请求信息
      console.log(`→ ${ctx.method} ${ctx.url}`);

      // 执行后续中间件和 Controller
      await next();

      // 计算响应时间
      const duration = Date.now() - startTime;

      // 记录响应信息
      console.log(`← ${ctx.method} ${ctx.url} ${ctx.status} ${duration}ms`);
    };
  }
}
```

## 代码解析

### 1. @Middleware() 装饰器

```typescript
@Middleware()
export class LoggerMiddleware { }
```

标记这是一个中间件类。

### 2. resolve() 方法

```typescript
resolve() {
  return async (ctx: Context, next: NextFunction) => {
    // 中间件逻辑
  };
}
```

返回中间件处理函数。

### 3. Context 对象

`ctx` 是 Koa 的上下文对象，包含：

- `ctx.request` - 请求对象
- `ctx.response` - 响应对象
- `ctx.method` - HTTP 方法
- `ctx.url` - 请求 URL
- `ctx.headers` - 请求头
- `ctx.body` - 响应体

### 4. next() 函数

```typescript
await next();
```

- 调用 `next()` 执行后续中间件
- **必须使用 await**，否则无法等待后续处理完成
- `next()` 之前的代码在请求阶段执行
- `next()` 之后的代码在响应阶段执行

## 注册中间件

在 `src/configuration.ts` 中注册：

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: { /* 配置 */ },
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // 注册全局中间件
    this.app.useMiddleware([LoggerMiddleware]);
  }
}
```

## 测试中间件

启动应用后，访问任何接口，都会在控制台看到日志：

```
→ GET /api/users
← GET /api/users 200 15ms

→ POST /api/users
← POST /api/users 201 32ms
```

## 中间件执行顺序

多个中间件按注册顺序执行：

```typescript
async onReady() {
  this.app.useMiddleware([
    Middleware1, // 最先执行
    Middleware2,
    Middleware3, // 最后执行
  ]);
}
```

执行流程：

```
请求 
  → Middleware1 (before next)
    → Middleware2 (before next)
      → Middleware3 (before next)
        → Controller
      ← Middleware3 (after next)
    ← Middleware2 (after next)
  ← Middleware1 (after next)
← 响应
```

## 动手实践

尝试创建一个响应时间中间件，记录慢请求：

```typescript
import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class ResponseTimeMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();

      await next();

      const duration = Date.now() - startTime;

      // 添加响应头
      ctx.set('X-Response-Time', `${duration}ms`);

      // 记录慢请求（超过 1 秒）
      if (duration > 1000) {
        console.warn(`⚠️ 慢请求: ${ctx.method} ${ctx.url} ${duration}ms`);
      }
    };
  }
}
```

## 条件性跳过中间件

有时候某些路由不需要中间件：

```typescript
@Middleware()
export class AuthMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 跳过登录接口
      if (ctx.path === '/api/auth/login') {
        return await next();
      }

      // 检查 token
      const token = ctx.headers['authorization'];
      if (!token) {
        ctx.status = 401;
        ctx.body = { message: '未登录' };
        return;
      }

      await next();
    };
  }
}
```

## 中间件配置

中间件可以接收配置参数：

```typescript
import { Middleware, Config } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class LoggerMiddleware {
  @Config('logger')
  loggerConfig;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (this.loggerConfig.enabled) {
        console.log(`${ctx.method} ${ctx.url}`);
      }
      await next();
    };
  }
}
```

在 `config.default.ts` 中配置：

```typescript
export default {
  logger: {
    enabled: true,
  },
};
```

## 小结

✅ 中间件用于处理通用逻辑
✅ 使用 `@Middleware()` 装饰器定义中间件
✅ `resolve()` 返回处理函数
✅ 必须调用 `await next()` 继续执行
✅ 多个中间件按注册顺序执行
✅ 中间件可以访问和修改 ctx

下一节，我们将学习如何进行应用配置管理！
