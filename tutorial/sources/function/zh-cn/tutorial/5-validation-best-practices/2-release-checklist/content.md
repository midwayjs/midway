---
type: lesson
title: 发布前最佳实践清单
focus: /src/server/index.ts
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

# 发布前最佳实践清单

上线前建议逐项确认：

1. 所有核心接口都定义了 `input/output`
2. 中间件和错误返回结构已统一
3. `config.local` 与生产配置边界清晰
4. 前端仅通过 `createClient` 调用接口
5. 至少覆盖核心链路测试（读、写、异常）
