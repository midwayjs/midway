---
title: 处理 POST 请求
focus: /src/controller/user.controller.ts
---

# 处理 POST 请求和请求体

到目前为止只处理了 GET。写操作一般用 POST / PUT / DELETE，数据放在请求体里，用 `@Body()` 读取。

## `@Post` 与 `@Body`

右侧 `src/controller/user.controller.ts` 已经有一个完整的用户 CRUD。创建用户这一段是核心：

```typescript
@Post('/')
async create(@Body() dto: CreateUserDTO) {
  const user = await this.userService.createUser(dto.name, dto.email);
  return {
    success: true,
    message: '用户创建成功',
    data: user,
  };
}
```

- `@Body()` 取出整个 JSON 对象
- `@Body('name')` 只取某一个字段
- 给 body 一个 interface / DTO 类型，后面做校验时可以直接复用

## 状态码

创建资源通常返回 201。注入 Koa 的 `Context` 即可：

```typescript
@Inject()
ctx: Context;

@Post('/')
async create(@Body() dto: CreateUserDTO) {
  this.ctx.status = 201;
  return { success: true, data: await this.userService.createUser(dto.name, dto.email) };
}
```

## 试一下

在右侧终端（或本机）发一个 POST：

```bash
curl -X POST http://localhost:7001/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"harry","email":"harry@example.com"}'
```

列表在 `GET /api/users`，更新用 `PUT /api/users/:id`，删除用 `DELETE /api/users/:id`。请求体必须带 `Content-Type: application/json`，否则 `@Body()` 会是空的。

## 文件上传

`@Files()` / `@Fields()` 需要上传组件。v4 请用 [`@midwayjs/busboy`](https://midwayjs.org/docs/extensions/busboy)，不要再用旧的 `@midwayjs/upload`。这一课不展开，文档里有完整示例。

请求体大小可以在配置里限制，例如 `koa.bodyParser.jsonLimit`。
