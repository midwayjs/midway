---
type: lesson
title: Inject Service in Controller
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

# Inject Service in Controller

Now that `UserService` is ready, let's inject it into a controller.

## What is Dependency Injection?

Dependency injection (DI) lets the framework create and provide dependencies for you.

### Manual creation (not recommended)

```typescript
class UserController {
  async list() {
    const userService = new UserService();
    return userService.getUsers();
  }
}
```

### Midway DI (recommended)

```typescript
@Controller('/users')
export class UserController {
  @Inject()
  userService: UserService;

  async list() {
    return this.userService.getUsers();
  }
}
```

## Build `UserController`

```typescript
import { Controller, Get, Query, Param, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return { success: true, data: users };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, data: user };
  }

  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    const users = await this.userService.searchUsers(keyword || '');
    return { success: true, data: users, count: users.length };
  }
}
```

## Routing recap

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get one user |
| GET | `/api/users/search?keyword=...` | Search users |

## Multiple injections

A controller can inject multiple services with `@Inject()`.

## Summary

- Use `@Inject()` to request dependencies
- Let Midway manage lifecycle and reuse instances
- Keep controller thin and delegate logic to service
