---
title: Create Your First Controller
focus: /src/controller/home.controller.ts
checks:
  - /info
---

# Create Your First Controller

A Controller handles HTTP requests and returns responses. The project on the right already has the smallest example: `GET /` returns a string.

## What is a Controller?

In Midway, a Controller is a class marked with `@Controller()`. Its methods map to HTTP routes.

```typescript
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

## How to read it

- `@Controller('/')` is the route prefix. Method paths are joined after it.
- `@Get('/')` handles GET. Full path = prefix + method path, here `/`.
- Return a string or an object: strings are sent as text, objects become JSON.

Other method decorators: `@Post()`, `@Put()`, `@Del()`, `@Patch()`.

## Exercise

Add `GET /info` that returns JSON:

```typescript
@Get('/info')
async info() {
  return {
    name: 'Midway.js',
    version: '4.0',
  };
}
```

Save, then point the preview at `/info`. Use **Solve** in the toolbar if you get stuck.
