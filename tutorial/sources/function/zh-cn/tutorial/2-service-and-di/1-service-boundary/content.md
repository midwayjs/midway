---
type: lesson
title: 业务逻辑下沉到 Service
focus: /src/server/service/user.service.ts
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

# 业务逻辑下沉到 Service

Functional 不等于“只写函数”，Service 仍是业务核心。

建议分层：

- API 层：请求解析、返回结构
- Service 层：业务规则、数据处理
