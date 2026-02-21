# Change: Core 内建 OpenTelemetry 的全入口异步追踪能力

## Why
当前 Midway 的 tracing 能力分散在 `core` 与 `@midwayjs/otel` 组件之间，导致能力入口分裂、依赖路径复杂、协议覆盖不一致。

这会导致：
- HTTP、WebSocket、gRPC、MQTT 等入口行为不一致，用户需要重复接入。
- HTTP client、gRPC client、WS emit、MQTT publish 等出口缺少统一上下文注入。
- 异步链路中的追踪上下文在不同入口存在丢失风险。
- 用户有自定义追踪策略需求（命名、提取、注入、采样）时缺少统一扩展点。
- `@midwayjs/otel` 为可选组件，难以作为所有 framework/client 的默认能力基线。

## What Changes
- 新增 capability：`request-entry-tracing`
  - 以 OpenTelemetry API 与 Context Propagation 为标准实现入口追踪。
  - 规定 HTTP / WebSocket / gRPC / MQTT 等入口默认自动创建 root span。
  - 规定入口解析与透传 W3C Trace Context（`traceparent`/`tracestate`）及兼容标识（如 `x-trace-id`）。
  - 规定跨 `await/Promise/定时器/事件回调` 的异步上下文追踪连续性。
  - 规定协议侧回传追踪标识（HTTP 响应头、gRPC metadata、WS/MQTT 上下文映射）。
- 新增 capability：`request-egress-tracing`
  - 规定框架托管的出口调用自动注入当前追踪上下文（HTTP client、gRPC client、WS emit、MQTT publish）。
  - 规定出口注入失败时的安全回退与诊断日志语义。
- 新增 capability：`tracing-customization`
  - 规定可配置与可扩展机制（按协议开关、span 命名策略、提取/注入策略、属性增强）。
  - 允许用户以 OpenTelemetry propagator 与 hook 方式自定义提取/注入。
  - 规定用户扩展优先级与回退行为，避免覆盖默认安全行为。
- 新增 capability：`tracing-core-consolidation`
  - 将原 `@midwayjs/otel` 中的核心 tracing 能力并入 `core`。
  - 移除独立 `@midwayjs/otel` 组件包，统一由 `core` 提供 tracing API 与配置能力。
  - 定义从 `@midwayjs/otel` 到 `@midwayjs/core` 的迁移规则。

## Impact
- Affected specs:
  - `request-entry-tracing`（新增）
  - `request-egress-tracing`（新增）
  - `tracing-customization`（新增）
  - `tracing-core-consolidation`（新增）
- Affected code（实施阶段预期）:
  - 基础承载：`packages/core`
  - Framework 入口层：`packages/web`、`packages/web-koa`、`packages/web-express`、`packages/ws`、`packages/socketio`、`packages/grpc`、`packages/mqtt`、`packages/kafka`、`packages/rabbitmq`、`packages/bull`、`packages/bullmq`、`packages/commander`、`packages/cron`、`packages/faas`、`packages/one-shot`、`packages/piscina`、`packages/mcp`
  - 出口客户端层：`packages/axios`、`packages/redis`、`packages/cache-manager`、`packages/oss`、`packages/cos`、`packages/tablestore`、`packages/etcd`、`packages/consul`，以及 `grpc/ws/socketio/kafka/mqtt/rabbitmq/bull/bullmq` 的 producer/client 侧
  - 对应测试目录与文档
- Out of Scope:
  - `packages/api-bridge`（前端侧）
  - `packages/tags`（废弃组件）
- Compatibility:
  - **BREAKING**：移除 `@midwayjs/otel` 包后，原组件导入路径需要迁移到 `@midwayjs/core`。
  - tracing 运行时能力保持语义兼容，配置键与 API 提供迁移映射。
