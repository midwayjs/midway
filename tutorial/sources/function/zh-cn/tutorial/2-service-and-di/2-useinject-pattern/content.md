---
type: lesson
title: useInject 注入服务
focus: /src/server/api/user.api.ts
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
    title: Midway 应用
autoReload: true
---

# useInject 注入服务

在 `*.api.ts` 中通过 `useInject` 获取 IoC 实例。

```ts
const service = await useInject(UserService);
return service.getUserById(String(input.params?.id || ''));
```

这样 API 层不需要手动 `new`，依赖由容器管理。
