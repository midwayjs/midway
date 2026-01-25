---
type: lesson
title: Introduction to Class Syntax
---

# Class Syntax

Midway uses a class-based approach with decorators for defining controllers and services.

## Controller

Controllers are responsible for handling incoming requests and returning responses to the client.

```typescript
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```
