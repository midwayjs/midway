---
title: 业务逻辑下沉到 Service
focus: /src/server/service/user.service.ts
---

# 业务逻辑下沉到 Service

Functional 不等于「只写函数」。路由契约放在 `*.api.ts`，业务规则仍然放进 Service。Service 继续用 `@Provide()`，和 Class 写法共用同一套 IoC。

建议分层：

- API 层：读 `input`、设状态码、组返回结构
- Service 层：查询、校验业务规则、写数据

右侧 `src/server/service/user.service.ts` 是一个内存用户表。下一课会在 API 里用 `useInject` 拿到它。
