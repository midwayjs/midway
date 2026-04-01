---
type: lesson
title: Create Your First Service
focus: /src/service/user.service.ts
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

# Create Your First Service

A service encapsulates business logic and keeps controllers clean.

## Create `UserService`

Create `src/service/user.service.ts`:

```typescript
import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  private users = [
    { id: 1, name: 'Tom', email: 'tom@example.com' },
    { id: 2, name: 'Jerry', email: 'jerry@example.com' },
    { id: 3, name: 'Kate', email: 'kate@example.com' },
  ];

  async getUsers() {
    return this.users;
  }

  async getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  async createUser(name: string, email: string) {
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

## Key points

### `@Provide()`
Registers this class into the IoC container.

### Service responsibility

Service should:
- hold business logic
- call databases/APIs
- transform data

Service should not:
- handle HTTP routing directly
- depend on `ctx` for request flow

### Async-first style

Service methods are usually async because real apps call I/O resources.

## Summary

- Register service with `@Provide()`
- Keep business logic in service layer
- Prefer async methods for consistency
