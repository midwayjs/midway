---
title: Handling POST Requests
preview: /api/users
focus: /src/controller/user.controller.ts
routes:
  - /api/users
  - /api/users/1
---

# Handling POST Requests and Bodies

So far we only handled GET. Writes usually use POST / PUT / DELETE, with data in the body via `@Body()`.

## `@Post` and `@Body`

`src/controller/user.controller.ts` already has a full user CRUD. Creating a user is the important part:

```typescript
@Post('/')
async create(@Body() dto: CreateUserDTO) {
  const user = await this.userService.createUser(dto.name, dto.email);
  return {
    success: true,
    message: 'User created successfully',
    data: user,
  };
}
```

- `@Body()` reads the whole JSON object
- `@Body('name')` reads one field
- Typing the body as a DTO/interface makes the next validation lesson drop in cleanly

## Status codes

Creating a resource usually returns 201. Inject Koa's `Context`:

```typescript
@Inject()
ctx: Context;

@Post('/')
async create(@Body() dto: CreateUserDTO) {
  this.ctx.status = 201;
  return { success: true, data: await this.userService.createUser(dto.name, dto.email) };
}
```

## Try it

```bash
curl -X POST http://localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"harry@example.com"}'
```

List is `GET /api/users`, update is `PUT /api/users/:id`, delete is `DELETE /api/users/:id`. The request must send `Content-Type: application/json` or `@Body()` will be empty.

## File uploads

`@Files()` / `@Fields()` need an upload component. In v4 use [`@midwayjs/busboy`](https://midwayjs.org/docs/extensions/busboy), not the old `@midwayjs/upload`. Body size can be limited with `koa.bodyParser.jsonLimit`.
