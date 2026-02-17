# 迁移指南

## 1. class 与 functional 共存

可以按模块渐进迁移，不需要一次性替换。

- 旧模块保持 `@Controller`
- 新模块用 `defineApi`
- 冲突按 method + fullPath 检测并报错

## 2. 从 class 迁移到 defineApi

建议顺序：

1. 保留原 service 层不动
2. 把 controller 路由声明迁移为 `defineApi`
3. `@Inject` 改为 `useInject`
4. 增加 `input/output` 校验
5. 删除旧 controller

## 3. 从 hooks 思路迁移

目标不是回到旧 hooks runtime，而是吸收其优势：

- 前后端一体化开发体验
- 类型复用与 direct-like 调用体验

同时保留 Midway 主线能力：

- IoC 与组件体系
- class / functional 并行
- 多框架与多协议扩展

## 4. 常见问题

### 为什么前端不能直接跑服务端 handler？

前端只消费 API 契约与类型。真实执行仍在服务端，避免把 Node runtime 打进浏览器。

### 为什么 Next/Nuxt 不接管路由？

这两类框架已有成熟路由约定。Midway 只做服务层桥接，减少心智冲突。

### 是否必须 `src/server`、`src/web`？

不是强制。目录可配置，文档中的路径是默认示例。
