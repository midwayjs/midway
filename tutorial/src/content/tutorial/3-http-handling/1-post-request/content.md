---
type: lesson
title: 处理 POST 请求
focus: /src/controller/user.controller.ts
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

# 处理 POST 请求和请求体

到目前为止，我们只处理了 GET 请求。现在让我们学习如何处理 POST、PUT、DELETE 等请求，并在响应中设置状态码、响应头，以及处理文件上传。

## 使用 @Post 装饰器

POST 请求通常用于创建资源或提交表单数据。

在右侧打开 `src/controller/user.controller.ts`，添加一个创建用户的接口：

```typescript
import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/')
  async create(@Body() body: any) {
    const { name, email } = body;
    const user = await this.userService.createUser(name, email);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }
}
```

## 获取请求体数据

### 1. 使用 @Body() 获取整个请求体

```typescript
@Post('/user')
async createUser(@Body() body: any) {
  return body; // { name: '张三', email: 'zhang@example.com' }
}
```

### 2. 使用 @Body(key) 获取特定字段

```typescript
@Post('/user')
async createUser(
  @Body('name') name: string,
  @Body('email') email: string
) {
  return { name, email };
}
```

### 3. 定义 DTO 接口（推荐）

创建 `src/interface.ts`：

```typescript
export interface CreateUserDTO {
  name: string;
  email: string;
  age?: number;
}
```

在 Controller 中使用：

```typescript
import { CreateUserDTO } from '../interface';

@Post('/')
async create(@Body() dto: CreateUserDTO) {
  const user = await this.userService.createUser(dto.name, dto.email);
  return {
    success: true,
    data: user,
  };
}
```

## 设置响应状态码和响应头

有时需要显式控制状态码或响应头。可以注入 `Context` 来设置：

```typescript
import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/api/users')
export class UserController {
  @Inject()
  ctx: Context;

  @Post('/')
  async create(@Body() body: any) {
    // 设置状态码
    this.ctx.status = 201;

    // 设置响应头
    this.ctx.set('X-Request-Id', this.ctx.requestId || 'local');

    return {
      success: true,
      message: '用户创建成功',
      data: body,
    };
  }
}
```

## 文件上传（multipart/form-data）

如果你需要处理文件上传，可以使用 `@Files()` 和 `@Fields()` 获取文件与表单字段：

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';

@Controller('/api/files')
export class FileController {
  @Post('/upload')
  async upload(@Files() files, @Fields() fields) {
    return {
      files,
      fields,
    };
  }
}
```

提示：文件上传由 upload 组件提供能力，确保项目已启用上传相关组件配置。

## 实现完整的 CRUD API

让我们创建一个完整的用户管理 API：

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Del,
  Param,
  Body,
  Query,
  Inject
} from '@midwayjs/core';
import { UserService } from '../service/user.service';

interface CreateUserDTO {
  name: string;
  email: string;
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
}

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  // 查询所有用户
  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users,
    };
  }

  // 获取单个用户
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
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
  }

  // 创建用户
  @Post('/')
  async create(@Body() dto: CreateUserDTO) {
    const user = await this.userService.createUser(dto.name, dto.email);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }

  // 更新用户
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO
  ) {
    const user = await this.userService.updateUser(parseInt(id), dto);
    if (!user) {
      return {
        success: false,
        message: '用户不存在',
      };
    }
    return {
      success: true,
      message: '用户更新成功',
      data: user,
    };
  }

  // 删除用户
  @Del('/:id')
  async delete(@Param('id') id: string) {
    const success = await this.userService.deleteUser(parseInt(id));
    if (!success) {
      return {
        success: false,
        message: '用户不存在',
      };
    }
    return {
      success: true,
      message: '用户删除成功',
    };
  }

  // 搜索用户
  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    const users = await this.userService.searchUsers(keyword || '');
    return {
      success: true,
      data: users,
      count: users.length,
    };
  }
}
```

## RESTful API 约定

| HTTP 方法 | 路径 | 操作 | 说明 |
|-----------|------|------|------|
| GET | `/users` | 查询列表 | 获取所有用户 |
| GET | `/users/:id` | 查询详情 | 获取单个用户 |
| POST | `/users` | 创建 | 创建新用户 |
| PUT | `/users/:id` | 更新 | 更新用户信息 |
| DELETE | `/users/:id` | 删除 | 删除用户 |

## 测试 API

使用 curl 或 Postman 测试：

### 1. 创建用户

```bash
curl -X POST http://localhost:7001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"赵六","email":"zhaoliu@example.com"}'
```

### 2. 更新用户

```bash
curl -X PUT http://localhost:7001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"张三-已更新"}'
```

### 3. 删除用户

```bash
curl -X DELETE http://localhost:7001/api/users/1
```

## 常见问题

### 1. 请求体为空？

确保客户端设置了正确的 Content-Type：

```
Content-Type: application/json
```

### 2. 如何处理表单数据？

Midway 默认支持 JSON 和表单数据：

```typescript
@Post('/form')
async handleForm(@Body() data: any) {
  return data;
}
```

### 3. 如何限制请求体大小？

在 `config.default.ts` 中配置：

```typescript
export default {
  bodyParser: {
    jsonLimit: '10mb', // JSON 请求体大小限制
    formLimit: '10mb', // 表单请求体大小限制
  },
};
```

## 小结

✅ 使用 `@Post()`, `@Put()`, `@Del()` 处理不同的 HTTP 方法
✅ 使用 `@Body()` 获取请求体数据
✅ 学会设置响应头和状态码
✅ 了解文件上传的基本方式
✅ 遵循 RESTful API 设计原则

下一节，我们将学习如何处理错误和异常！
