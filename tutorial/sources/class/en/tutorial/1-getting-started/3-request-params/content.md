---
type: lesson
title: Read Request Parameters
focus: /src/controller/home.controller.ts
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

# Read Request Parameters

Midway provides decorators for common parameter types.

## Common decorators

| Decorator | Purpose | Example |
| --- | --- | --- |
| `@Query()` | Query string | `/user?name=tom` |
| `@Param()` | Route params | `/user/:id` |
| `@Body()` | Request body | JSON payload |
| `@Headers()` | Request headers | `Authorization` |

## Query params with `@Query`

```typescript
import { Controller, Get, Query } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/greet')
  async greet(@Query('name') name: string) {
    return `Hello, ${name || 'Guest'}!`;
  }
}
```

## Route params with `@Param`

```typescript
@Get('/user/:id')
async getUserById(@Param('id') id: string) {
  return {
    userId: id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
  };
}
```

## Combine multiple params

```typescript
@Get('/search/:category')
async search(
  @Param('category') category: string,
  @Query('keyword') keyword: string,
  @Query('page') page: string = '1'
) {
  return {
    category,
    keyword,
    page: parseInt(page),
    results: [],
  };
}
```

## Practice: calculator API

```typescript
@Get('/calc/:operation')
async calculate(
  @Param('operation') operation: string,
  @Query('a') a: string,
  @Query('b') b: string
) {
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);

  let result: number;
  switch (operation) {
    case 'add':
      result = num1 + num2;
      break;
    case 'subtract':
      result = num1 - num2;
      break;
    case 'multiply':
      result = num1 * num2;
      break;
    case 'divide':
      result = num1 / num2;
      break;
    default:
      return { error: 'Unsupported operation' };
  }

  return { operation, a: num1, b: num2, result };
}
```

## Type conversion reminder

URL params are strings. Convert as needed:

- Number: `parseInt()` / `parseFloat()`
- Boolean: `value === 'true'`
- Date: `new Date(value)`

## Summary

- Use `@Query()` for query strings
- Use `@Param()` for route params
- Combine decorators freely in one method
- Always handle type conversion and validation
