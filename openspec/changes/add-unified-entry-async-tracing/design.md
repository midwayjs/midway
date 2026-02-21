## Context
Midway 在可观测性方面已有组件能力，但不同入口协议在“入口建链、上下文透传、异步连续性、回传机制”上缺乏统一规范，导致接入成本与行为差异较高。

该变更覆盖 HTTP、WebSocket、gRPC 等多入口，涉及 core 上下文管理、协议适配层与多客户端出口注入，属于跨子系统设计。

本方案默认采用 OpenTelemetry 作为追踪标准：使用 OTel Tracer API 创建 span，使用 OTel Context API 维护活动上下文，使用 OTel Propagation API 完成提取与注入。Tracing API 将内建于 `core`，不再依赖独立 `otel` 包。

## Goals / Non-Goals
- Goals:
  - 提供全入口统一的自动 root span 创建机制。
  - 保证请求上下文在异步调用链中稳定传播。
  - 提供协议级上下文透传与回传能力。
  - 提供可插拔的自定义机制，允许业务覆盖默认策略。
- Non-Goals:
  - 不强制绑定单一追踪后端厂商。
  - 不在本提案中定义完整 UI/监控平台集成。
  - 不改变用户业务 handler 的核心调用方式。

## Scope
- In Scope（本次改造）:
  - 基础承载：`packages/core`
  - Framework 入口层：`packages/web`、`packages/web-koa`、`packages/web-express`、`packages/ws`、`packages/socketio`、`packages/grpc`、`packages/mqtt`、`packages/kafka`、`packages/rabbitmq`、`packages/bull`、`packages/bullmq`、`packages/commander`、`packages/cron`、`packages/faas`、`packages/one-shot`、`packages/piscina`、`packages/mcp`
  - 出口客户端层：`packages/axios`、`packages/redis`、`packages/cache-manager`、`packages/oss`、`packages/cos`、`packages/tablestore`、`packages/etcd`、`packages/consul`，以及消息/RPC 组件的 producer/client 侧
- Out of Scope（本次不改）:
  - `packages/api-bridge`（前端侧）
  - `packages/tags`（废弃组件）

## Package Consolidation
- `@midwayjs/otel` 的能力（如 `TraceService`、`@Trace`、`ctx.traceId` 接入）合并到 `@midwayjs/core`。
- 移除独立 `packages/otel` 包并在迁移文档中提供等价替换路径。
- 迁移后，framework/client 仅依赖 `core` tracing 接口，不感知组件化差异。

## Architecture
采用“核心编排 + 协议适配 + 扩展点”三层模型：

1. Core Entry Tracing Orchestrator
- 在请求进入框架入口时创建或恢复追踪上下文。
- 通过 OpenTelemetry `context` 维护 active span，并与 Midway async context manager 绑定。
- 决策 root span 的生命周期（开始、结束、异常标记）。
- 与 async context manager 对接，确保跨异步边界上下文不丢失。
- 提供默认 no-op 与可配置 OTel 执行器，保证 tracing 失败不影响主流程。

2. Protocol Entry Adapters
- HTTP：按 OTel propagator 从请求头提取（默认 W3C Trace Context），并在响应头回传追踪标识。
- gRPC：按 OTel propagator 从 metadata 提取并在响应 metadata 回传追踪标识。
- WebSocket：在连接与消息处理阶段按 OTel context 注入/继承上下文，并暴露可回传映射。

3. Customization Extension Points
- 提取策略：允许自定义提取器（例如自定义 header/metadata key）。
- 注入策略：允许自定义响应/回传写入逻辑。
- 命名策略：允许按协议、路由、事件名生成 span 名称。
- 属性增强：允许统一追加业务标签（tenantId、region、bizCode 等）。
- 协议开关：允许按协议启停默认入口追踪。
- OTel 扩展：允许替换或包装默认 propagator、span processor 相关入口 hook。

## Key Decisions
- 决策 1：默认自动化优先
  - 各入口默认启用自动 root span + 异步上下文传播，降低零配置成本。
- 决策 2：扩展点前置且可组合
  - 自定义逻辑通过统一扩展点与 OTel 扩展点插入，不要求 fork 入口实现。
- 决策 2A：能力并入 core
  - tracing API 与默认 OTel 实现统一放在 core，避免可选组件导致的依赖分裂。
- 决策 3：失败安全
  - 追踪相关故障不应中断业务请求主流程；失败时回退到最小可用行为。
- 决策 4：协议一致语义
  - 不同协议保持一致生命周期语义（entry start / handler run / finalize）。

## Risks / Trade-offs
- 过多扩展点会增加配置复杂度。
  - 缓解：提供稳定默认值并限制必填项。
- 多协议语义映射存在边界差异（特别是 WS 长连接）。
  - 缓解：定义连接级与消息级两类语义并要求显式配置优先级。
- 异步上下文在第三方库中可能断链。
  - 缓解：定义降级策略与诊断日志，保证业务可运行。

## Validation Strategy
- 协议级验收：HTTP/WS/gRPC 至少各有一条入口链路验证。
- 异步连续性验收：`await`、定时器、事件回调三个场景验证 trace 连续。
- 自定义扩展验收：覆盖提取器、命名器、属性增强、协议开关四类扩展点。
- 回归验收：关闭该能力时保持现有行为兼容。
