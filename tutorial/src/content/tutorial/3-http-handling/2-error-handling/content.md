---
type: lesson
title: 错误处理
focus: /src/filter/default.filter.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---

# 错误处理与异常

在实际应用中，我们需要优雅地处理各种错误情况，给用户提供清晰的错误信息。

## 为什么需要错误处理？

良好的错误处理可以：

- ✅ 提供清晰的错误信息
- ✅ 防止应用崩溃
- ✅ 记录错误日志便于调试
- ✅ 返回正确的 HTTP 状态码

## 1. 基本错误处理

### 使用 try-catch

最基本的错误处理方式：

```typescript
import { Controller, Get, Param, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    try {
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return {
          success: false,
          message: 'ID 必须是数字',
        };
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: '服务器内部错误',
        error: error.message,
      };
    }
  }
}
```

## 2. 使用 HTTP 异常

Midway 提供了 `MidwayHttpError`，可以方便地抛出 HTTP 异常。

```typescript
import { Controller, Get, Param, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw new MidwayHttpError('ID 必须是数字', 400);
    }

    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new MidwayHttpError('用户不存在', 404);
    }

    return {
      success: true,
      data: user,
    };
  }
}
```

### 常用 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 400 | Bad Request | 客户端请求参数错误 |
| 401 | Unauthorized | 未登录或 token 失效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

## 3. 自定义错误类

创建 `src/error/custom.error.ts`：

```typescript
import { MidwayHttpError } from '@midwayjs/core';

// 业务错误基类
export class BusinessError extends MidwayHttpError {
  constructor(message: string, code?: string) {
    super(message, 400);
    this.code = code || 'BUSINESS_ERROR';
  }
  code: string;
}

// 资源不存在错误
export class NotFoundError extends MidwayHttpError {
  constructor(resource: string) {
    super(`${resource}不存在`, 404);
  }
}

// 验证错误
export class ValidationError extends MidwayHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

// 未授权错误
export class UnauthorizedError extends MidwayHttpError {
  constructor(message: string = '未登录或登录已过期') {
    super(message, 401);
  }
}
```

### 使用自定义错误

```typescript
import { Controller, Post, Body, Inject, Get, Param } from '@midwayjs/core';
import { UserService } from '../service/user.service';
import { ValidationError, NotFoundError } from '../error/custom.error';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/')
  async create(@Body() body: any) {
    const { name, email } = body;

    if (!name || !email) {
      throw new ValidationError('姓名和邮箱不能为空');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('邮箱格式不正确');
    }

    const user = await this.userService.createUser(name, email);

    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw new ValidationError('用户ID必须是数字');
    }

    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('用户');
    }

    return {
      success: true,
      data: user,
    };
  }
}
```

## 4. 全局错误过滤器

为了统一处理所有错误，可以创建全局错误过滤器。

创建 `src/filter/default.filter.ts`：

```typescript
import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 记录错误日志
    ctx.logger.error(err);

    // 返回统一的错误响应
    return {
      success: false,
      message: err.message || '服务器内部错误',
      code: err['code'] || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
  }
}
```

在 `configuration.ts` 中注册：

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { DefaultErrorFilter } from './filter/default.filter';

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
    // 注册全局错误过滤器
    this.app.useFilter([DefaultErrorFilter]);
  }
}
```

## 5. Service 层的错误处理

Service 也应该进行错误处理：

```typescript
import { Provide } from '@midwayjs/core';
import { NotFoundError, BusinessError } from '../error/custom.error';

@Provide()
export class UserService {
  private users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
  ];

  async getUserById(id: number) {
    const user = this.users.find(u => u.id === id);

    if (!user) {
      throw new NotFoundError('用户');
    }

    return user;
  }

  async createUser(name: string, email: string) {
    const exists = this.users.some(u => u.email === email);
    if (exists) {
      throw new BusinessError('邮箱已被使用');
    }

    const newUser = {
      id: this.users.length + 1,
      name,
      email,
    };

    this.users.push(newUser);
    return newUser;
  }
}
```

## 动手实践

尝试添加以下验证逻辑：

1. **用户名长度验证**

```typescript
if (name.length < 2 || name.length > 20) {
  throw new ValidationError('用户名长度必须在 2-20 个字符之间');
}
```

2. **邮箱唯一性检查**

```typescript
const existingUser = await this.userService.findByEmail(email);
if (existingUser) {
  throw new BusinessError('该邮箱已被注册');
}
```

3. **年龄范围验证**

```typescript
if (age && (age < 0 || age > 150)) {
  throw new ValidationError('年龄必须在 0-150 之间');
}
```

## 小结

✅ 使用 try-catch 处理同步和异步错误
✅ 使用 MidwayHttpError 抛出 HTTP 异常
✅ 创建自定义错误类提高代码可读性
✅ 使用错误过滤器统一处理错误
✅ 在 Service 层也要进行错误处理
✅ 返回合适的 HTTP 状态码和错误信息

下一节，我们将学习如何使用中间件！
