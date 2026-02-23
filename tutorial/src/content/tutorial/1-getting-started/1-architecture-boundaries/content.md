---
type: lesson
title: 目录与模块边界
focus: /README.md
editor:
  fileTree:
    allowEdits: false
terminal: false
previews: false
---

# 目录与模块边界

Functional 教程统一按「契约先行」组织代码。

```txt
src
├── server
│   ├── index.ts
│   └── api
│       └── user.api.ts
└── web
    └── api
        └── client.ts
```

## 规则

- 接口定义文件统一为 `*.api.ts`
- 后端路由契约放在 `src/server/api`
- 前端只消费契约，不手写 URL 字符串
