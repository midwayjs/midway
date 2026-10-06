---
title: useInject 注入服务
focus: /src/server/api/user.api.ts
checks:
  - /users/search?keyword=harry
---

# useInject 注入服务

在 handler 里通过 `useInject` 拿 IoC 实例，不要 `new UserService()`。

```ts
const service = await useInject(UserService);
return service.getUserById(input.params.id);
```

这样依赖由容器管理，测试时也可以替换实现。

右侧 `user.api.ts` 已经实现了列表和按 id 查询。`GET /users`、`GET /users/u-1` 可以直接看。

## 练习

把 `search` 补完：用 `input.query.keyword` 调用 `userService.searchUsers`，返回 `{ success, data, count }`。完成后访问 `/users/search?keyword=harry`。
