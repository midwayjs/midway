---
type: lesson
title: 契约校验（input/output）
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

# 契约校验（input/output）

Functional 推荐在 API 契约层直接做校验：

- `input(...)` 保护请求输入
- `output(...)` 保护响应结构

把类型安全和运行时安全放在同一个入口维护。
