---
type: lesson
title: Error Handling
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
    title: Midway App
autoReload: true
---

# Error Handling and Exceptions

Good error handling improves API reliability and developer experience.

## Why it matters

- Return clear error messages
- Prevent unhandled crashes
- Keep proper HTTP status codes
- Make debugging easier

## Basic approach with `try/catch`

```typescript
@Get('/:id')
async getOne(@Param('id') id: string) {
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return { success: false, message: 'ID must be a number' };
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      message: 'Internal server error',
      error: error.message,
    };
  }
}
```

## Throw HTTP errors with `MidwayHttpError`

```typescript
import { MidwayHttpError } from '@midwayjs/core';

if (isNaN(userId)) {
  throw new MidwayHttpError('ID must be a number', 400);
}

if (!user) {
  throw new MidwayHttpError('User not found', 404);
}
```

## Common status codes

| Code | Meaning | Typical use |
| --- | --- | --- |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 500 | Internal Server Error | Unexpected server error |

## Custom error classes

```typescript
import { MidwayHttpError } from '@midwayjs/core';

export class BusinessError extends MidwayHttpError {
  constructor(message: string, code?: string) {
    super(message, 400);
    this.code = code || 'BUSINESS_ERROR';
  }
  code: string;
}

export class NotFoundError extends MidwayHttpError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}
```

## Summary

- Validate input early
- Throw meaningful HTTP errors
- Keep response format consistent
- Centralize handling with filters/middleware when possible
