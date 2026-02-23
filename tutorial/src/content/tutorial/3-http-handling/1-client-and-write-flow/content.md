---
type: lesson
title: client 接入与写接口
focus: /src/web/api/client.ts
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

# client 接入与写接口

本课打通一条完整链路：

1. `src/server/api/user.api.ts` 定义读写接口
2. `src/web/api/client.ts` 用 `createClient` 生成客户端
3. 页面文件调用 `api.user.*`

```ts
export const api = createClient({ user: userApi }, { basePath: '/api' });
```

这就是 Functional 一体化的核心收益：同一份契约双端复用。
