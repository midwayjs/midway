---
type: lesson
title: 依赖注入的使用
focus: /src/controller/user.controller.ts
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

# 在 Controller 中注入 Service

现在我们已经创建了 UserService，让我们学习如何在 Controller 中使用它。

## 什么是依赖注入？

依赖注入（DI）是一种设计模式，它让我们不需要手动创建对象实例，框架会自动帮我们注入需要的依赖。

### 传统方式（❌ 不推荐）

```typescript
class UserController {
  async list() {
    const userService = new UserService(); // 手动创建
    return userService.getUsers();
  }
}
```

问题：
- 每次调用都创建新实例，浪费资源
- 难以测试（无法 mock）
- 如果 UserService 构造函数有参数，代码会更复杂

### Midway 方式（✅ 推荐）

```typescript
@Controller('/users')
export class UserController {
  @Inject()
  userService: UserService; // 自动注入

  async list() {
    return this.userService.getUsers();
  }
}
```

优势：
- 框架自动管理实例
- 易于测试（可以注入 mock 对象）
- 代码更简洁

## 创建 User Controller

让我们创建一个完整的 UserController 来使用 UserService。

在 `src/controller/user.controller.ts` 中：

```typescript
import { Controller, Get, Post, Query, Param, Body, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  // 获取所有用户
  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users
    };
  }

  // 获取单个用户
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      };
    }
    return {
      success: true,
      data: user
    };
  }

  // 搜索用户
  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    const users = await this.userService.searchUsers(keyword || '');
    return {
      success: true,
      data: users,
      count: users.length
    };
  }
}
```

## 代码解析

### 1. 导入依赖

```typescript
import { Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';
```

### 2. 注入 Service

```typescript
@Inject()
userService: UserService;
```

- `@Inject()` 告诉框架需要注入依赖
- `userService` 是属性名，可以自定义
- `UserService` 是类型，告诉框架需要注入什么类型的对象

### 3. 使用 Service

```typescript
const users = await this.userService.getUsers();
```

- 通过 `this.userService` 访问
- 不需要关心实例如何创建
- 使用 `await` 等待异步操作完成

## 路由说明

我们定义了三个 API 路由：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 获取所有用户 |
| GET | `/api/users/:id` | 获取单个用户 |
| GET | `/api/users/search?keyword=xxx` | 搜索用户 |

每个路由都通过注入的 `userService` 来获取数据。

## 代码示例

在右侧编辑器中，你会看到 UserController 的实现：

```typescript
@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return { success: true, data: users };
  }
}
```

这里的关键是 `@Inject()` 装饰器，它告诉 Midway 自动注入 UserService 实例。

## 注入多个依赖

一个 Controller 可以注入多个 Service：

```typescript
@Controller('/api/posts')
export class PostController {
  @Inject()
  userService: UserService;

  @Inject()
  postService: PostService;

  @Inject()
  commentService: CommentService;

  @Get('/:id/details')
  async getPostWithDetails(@Param('id') id: string) {
    const post = await this.postService.getById(id);
    const author = await this.userService.getUserById(post.authorId);
    const comments = await this.commentService.getByPostId(id);

    return {
      post,
      author,
      comments
    };
  }
}
```

## 依赖注入的作用域

默认情况下，Service 是单例的（Singleton），整个应用共享一个实例。

如果需要每次请求创建新实例，可以使用 `@Scope()` 装饰器：

```typescript
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Request) // 每次请求创建新实例
export class UserService {
  // ...
}
```

常用作用域：
- `ScopeEnum.Singleton` - 单例（默认）
- `ScopeEnum.Request` - 每个请求一个实例
- `ScopeEnum.Prototype` - 每次注入都创建新实例

## 小结

✅ 使用 `@Inject()` 注入依赖
✅ 不需要手动创建实例
✅ 一个类可以注入多个依赖
✅ 默认是单例模式
✅ Service 和 Controller 完全解耦

下一节，我们将学习如何处理 POST 请求和请求体数据！
