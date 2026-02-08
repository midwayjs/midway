---
type: lesson
title: Handle POST Requests
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
    title: Midway App
autoReload: true
---

# Handle POST Requests and Request Body

So far we mostly used GET routes. Let's add write operations.

## `@Post()` basics

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
      message: 'User created successfully',
      data: user,
    };
  }
}
```

## Read body fields

### Entire body

```typescript
@Post('/user')
async createUser(@Body() body: any) {
  return body;
}
```

### Specific fields

```typescript
@Post('/user')
async createUser(
  @Body('name') name: string,
  @Body('email') email: string
) {
  return { name, email };
}
```

### DTO style (recommended)

```typescript
export interface CreateUserDTO {
  name: string;
  email: string;
  age?: number;
}

@Post('/')
async create(@Body() dto: CreateUserDTO) {
  const user = await this.userService.createUser(dto.name, dto.email);
  return { success: true, data: user };
}
```

## Set status code and response headers

```typescript
import { Context } from '@midwayjs/koa';

@Inject()
ctx: Context;

@Post('/')
async create(@Body() body: any) {
  this.ctx.status = 201;
  this.ctx.set('X-Request-Id', this.ctx.requestId || 'local');
  return {
    success: true,
    message: 'User created successfully',
    data: body,
  };
}
```

## File upload basics

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';

@Controller('/api/files')
export class FileController {
  @Post('/upload')
  async upload(@Files() files, @Fields() fields) {
    return { files, fields };
  }
}
```

## Summary

- Use `@Post()` for create/submit operations
- Use `@Body()` for payload access
- Use `ctx` to control status and headers when needed
