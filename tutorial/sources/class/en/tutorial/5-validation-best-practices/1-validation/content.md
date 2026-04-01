---
type: lesson
title: Data Validation
focus: /src/dto/user.dto.ts
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

# Data Validation

Validation is essential for correctness, security, and stable APIs.

## Why validate?

Without validation, you can get:

- Malicious payload injection
- Type mismatches
- Invalid business data
- Downstream persistence errors

With validation, you get predictable and safer behavior.

## Install validation component

```bash
npm install @midwayjs/validate
```

`package.json`:

```json
{
  "dependencies": {
    "@midwayjs/validate": "^4.0.0"
  }
}
```

Optional Swagger support:

```bash
npm install @midwayjs/swagger
```

`package.json`:

```json
{
  "dependencies": {
    "@midwayjs/swagger": "^4.0.0"
  }
}
```

## Enable validate component

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';

@Configuration({
  imports: [koa, validate],
})
export class MainConfiguration {}
```

## DTO + `@Validate()`

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class CreateUserDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().email().required())
  email: string;

  @Rule(RuleType.number().min(0).max(150).optional())
  age?: number;
}
```

```typescript
import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';

@Post('/')
@Validate()
async create(@Body() dto: CreateUserDTO) {
  const user = await this.userService.createUser(dto.name, dto.email);
  return {
    success: true,
    message: 'User created successfully',
    data: user,
  };
}
```

## Summary

- Define validation in DTO classes
- Use `@Validate()` on handlers
- Keep validation close to API contract
