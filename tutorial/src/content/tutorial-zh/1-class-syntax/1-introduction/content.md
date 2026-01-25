---
type: lesson
title: Class 语法入门
---

# Class 语法

Midway 默认采用 **Class + Decorator** 的写法来组织控制器与服务，代码结构清晰、利于依赖注入与测试。

## 1. 定义 Controller

Controller 负责接收请求并返回响应。使用 `@Controller` 指定路由前缀，`@Get`/`@Post` 等指定方法路由。

```typescript
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midway.js!';
  }
}
```

- `@Controller('/')`：设置控制器的路由前缀
- `@Get('/')`：声明 GET 请求的路由

## 2. 抽离 Service

把业务逻辑放在 Service 中更易维护。Service 使用 `@Provide()` 注册到 IoC 容器中。

```typescript
import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  async list() {
    return ['alice', 'bob', 'charlie'];
  }
}
```

## 3. 依赖注入

在 Controller 中通过 `@Inject()` 注入 Service。

```typescript
import { Controller, Get, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list() {
    return this.userService.list();
  }
}
```

## 4. 参数获取

常见参数可通过装饰器获取：

```typescript
import { Controller, Get, Query, Param } from '@midwayjs/core';

@Controller('/users')
export class UserController {
  @Get('/:id')
  async detail(@Param('id') id: string, @Query('verbose') verbose?: string) {
    return { id, verbose: verbose === 'true' };
  }
}
```

- `@Param()`：路由参数
- `@Query()`：查询参数

## 5. 返回 JSON

Midway 支持直接返回对象，框架会自动序列化为 JSON：

```typescript
import { Controller, Get } from '@midwayjs/core';

@Controller('/health')
export class HealthController {
  @Get('/')
  async check() {
    return { status: 'ok', ts: Date.now() };
  }
}
```

## 小结

你已经掌握了 Class 语法的基础用法：

- Controller 路由定义
- Service 抽离
- 依赖注入
- 参数获取
- JSON 返回

下一步可以继续补充：校验、异常处理与中间件等内容。
