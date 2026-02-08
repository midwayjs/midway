---
type: lesson
title: Create Your First Controller
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

# Create Your First Controller

A controller handles HTTP requests and returns responses.

## What is a Controller?

In Midway, a controller is a class decorated with `@Controller()`. Its methods are mapped to routes using decorators like `@Get()`.

## Example

```typescript
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

## How it works

### `@Controller('/')`
Defines a route prefix for all methods in this class.

### `@Get('/')`
Maps the method to an HTTP GET route.

### Return value
- String values are returned as text responses.
- Objects are returned as JSON.

## Try it

Update the response text:

```typescript
async home() {
  return 'Hello Midwayjs! Welcome to the interactive tutorial!';
}
```

## Add one more route

```typescript
@Get('/info')
async info() {
  return {
    name: 'Midway.js',
    version: '4.0',
    description: 'A future-ready Node.js framework',
  };
}
```

## Common method decorators

- `@Get()`
- `@Post()`
- `@Put()`
- `@Del()`
- `@Patch()`

## Summary

- Controllers are defined with `@Controller()`
- Routes are declared with HTTP decorators
- Return values are automatically converted to HTTP responses

Next, let's read request parameters.
