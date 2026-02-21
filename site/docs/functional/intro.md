# 概览

这套文档的目标只有一个：让你尽快把前后端联调跑起来。

如果你是第一次接触 Functional，建议按下面顺序阅读：

1. [函数式基础](./fundamentals.md)
2. [函数式 API](./api-reference.md)
3. [前端集成](./frontend-integration.md)
4. [参数校验](./validation.md)
5. [测试](./testing.md)
6. [构建部署](./build-deploy.md)

## 你会得到什么

- 后端定义一次 API（method/path/参数）
- 前端直接调用 `api.user.getUser(...)`
- 调用参数和返回值都有类型提示
- 减少手写请求路径和联调沟通成本

## 和现有写法的关系

Functional 不是替代 Class Controller，两者可以无冲突共存。

选型建议：

- 如果要和前端在同一仓库协同开发，优先使用 `defineApi`。
- 如果只是提供 API 服务，`@Controller` 和 `defineApi` 都可以，按团队习惯选择。

## 整体流程

1. 在 `src/server/api` 定义接口（`defineApi`）。
2. 在前端通过 `createClient` 复用这份定义。
3. 页面里直接调用 `api.xxx.yyy()`。
4. 请求仍然发到服务端执行，不会在浏览器里执行后端代码。

## 推荐目录（默认）

```txt
src
├── server
│   └── api
│       └── user.api.ts   # 用户 API 定义（defineApi）
└── web
    └── api
        └── client.ts     # 前端 API 客户端创建
```

详细目录约束见：[一体化目录与边界](./workspace.md)

## 下一步

- 想先了解概念：看 [函数式基础](./fundamentals.md)
- 想查 API 清单：看 [函数式 API](./api-reference.md)
- 想先做前端联调：看 [前端集成](./frontend-integration.md)
- 想看参数校验：看 [参数校验](./validation.md)
- 想先补测试：看 [测试](./testing.md)
- 想准备上线：看 [构建与部署](./build-deploy.md)
