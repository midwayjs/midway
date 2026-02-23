---
type: lesson
title: 错误边界与返回规范
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

# 错误边界与返回规范

统一错误处理建议：

- 参数错误：尽量前置到校验层
- 业务错误：在 handler 中抛明确异常
- 响应格式：保持 `success/message/code` 一致

这样前端能稳定处理错误分支。
