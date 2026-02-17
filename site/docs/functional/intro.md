# Functional 一体化概览

Functional 模式的目标是把 Midway 的 `@Controller` / `@Get` / `@Post` 等装饰器能力，扩展为前端同学更容易理解的函数式 API 定义方式。

核心原则：

- `class decorator` 与 `functional` 共存，二者是偏好，不是替代关系
- API 定义以 `src/server/api` 为单一真相源
- 前端直接复用 API 定义与类型，运行时仍走真实 HTTP/协议调用
- 前后端开发可一体化，发布时产物分离

## 文档导航

- [defineApi 基础用法](./define-api.md)
- [一体化目录与边界](./workspace.md)
- [React 集成](./react.md)
- [Next.js 集成](./nextjs.md)
- [Vue / Nuxt 集成设计](./vue-nuxt.md)
- [构建与部署](./build-deploy.md)
- [迁移指南（class/hooks -> functional）](./migration.md)
