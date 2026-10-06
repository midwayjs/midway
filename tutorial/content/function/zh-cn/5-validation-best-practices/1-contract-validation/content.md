---
title: 契约校验（input / output）
preview: /users
focus: /src/server/api/user.api.ts
routes:
  - /users
  - /users/u-1
---

# 契约校验（input / output）

`.input()` 拦住非法请求，`.output()` 拦住非法响应。schema 同时提供运行时校验和 handler 内的类型。

```ts
create: api
  .post('/')
  .input(CreateUserInputSchema)
  .output(UserOutputSchema)
  .handle(async ({ input }) => {
    return service.createUser(input.body.name, input.body.email, input.body.age);
  }),
```

校验失败会在进入 / 离开业务前抛错。业务规则（比如「邮箱已被占用」）仍放在 Service，不要全堆在 schema 里。

右侧 `create` 已经有 `input`。

## 练习

给 `create` 补上 `.output(UserOutputSchema)`。`UserOutputSchema` 已在 `src/server/dto/user.dto.ts`。补完后用合法 JSON POST `/users`，响应必须符合 `{ id, name, email, age? }`。
