---
type: lesson
title: input 参数模型
focus: /src/server/api/home.api.ts
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

# input 参数模型

Functional API 统一从 `input` 读取请求数据。

- `input.params`
- `input.query`
- `input.body`
- `input.headers`

```ts
getUserById: api.get('/user/:id').handle(async ({ input }) => {
  return { id: input.params?.id };
});
```

从这一层开始就可以形成稳定的请求契约。
