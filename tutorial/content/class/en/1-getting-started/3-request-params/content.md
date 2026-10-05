---
title: Request Parameters
focus: /src/controller/home.controller.ts
checks:
  - /calc/add?a=1&b=2
---

# Request Parameters

GET data usually comes from the query string or the path. This lesson covers `@Query()` and `@Param()`.

## Query with `@Query`

`name` in `/greet?name=harry` is read with `@Query('name')`:

```typescript
@Get('/greet')
async greet(@Query('name') name: string) {
  return `Hello, ${name || 'Guest'}!`;
}
```

The route is already in the editor. Point the preview at `/greet?name=harry`.

## Path params with `@Param`

`42` in `/user/42` matches `:id`:

```typescript
@Get('/user/:id')
async getUserById(@Param('id') id: string) {
  return { userId: id };
}
```

Path params are always strings. Convert them yourself when you need a number.

## Exercise

Add `GET /calc/:operation` that reads `a` and `b` from the query:

- `/calc/add?a=1&b=2` should return `{ operation, a, b, result: 3 }`
- Support `add` / `subtract` / `multiply` / `divide`

The starter does not include this method yet. Use **Solve** if you want the reference implementation.
