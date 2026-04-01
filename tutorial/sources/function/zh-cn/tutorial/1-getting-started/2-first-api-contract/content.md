---
type: lesson
title: 第一个 API 契约
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

# 第一个 API 契约

这一课只做一件事：写出第一个 `defineApi`。

```ts
import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),
}));
```

核心是把“路由声明 + 处理函数”放到同一个模块里。
