## 1. 规格与范围冻结
- [x] 1.1 确认入口与出口协议清单（HTTP、WebSocket、gRPC、MQTT 及同类协议）与术语定义
- [x] 1.2 冻结默认行为：基于 OpenTelemetry 自动 root span、异步传播、透传与回传
- [x] 1.3 冻结失败安全原则与兼容边界（不影响业务主流程）

## 2. 核心追踪编排实现
- [x] 2.1 在 core 定义统一入口追踪编排接口与生命周期钩子
- [x] 2.2 将入口追踪编排与 async context manager 对齐
- [x] 2.3 定义统一错误标记与 span 完结语义
- [x] 2.4 将 `@midwayjs/otel` 的核心 tracing API 合并到 core（含 `@Trace`、`TraceService`、`ctx.traceId`）
- [x] 2.5 移除 `packages/otel` 并完成对内引用替换

## 3. 协议入口接入
- [x] 3.1 接入 HTTP 入口（请求提取 + 响应回传）
- [x] 3.2 接入 WebSocket 入口（连接/消息语义 + 上下文映射）
- [x] 3.3 接入 gRPC 入口（metadata 提取与回传）
- [x] 3.4 接入 MQTT 入口（消息 metadata 提取与上下文恢复）
- [x] 3.5 接入 Kafka / RabbitMQ 入口（消息 headers 提取与上下文恢复）
- [x] 3.6 接入 Bull / BullMQ Worker 入口（job metadata 恢复）
- [x] 3.7 接入 Commander / Cron / FaaS / OneShot / Piscina / MCP 入口（任务执行上下文追踪）
- [x] 3.8 补充同类入口的最小一致性适配（按协议能力映射）

## 4. 协议出口接入
- [x] 4.1 接入 HTTP client 出口（header 注入）
- [x] 4.2 接入 gRPC client 出口（metadata 注入）
- [x] 4.3 接入 WebSocket emit 出口（事件上下文注入）
- [x] 4.4 接入 MQTT publish 出口（消息属性注入）
- [x] 4.5 接入 Kafka / RabbitMQ producer 出口（headers 注入）
- [x] 4.6 接入 Bull / BullMQ producer 出口（job metadata 注入）
- [x] 4.7 接入 Redis / Cache / OSS / COS / Tablestore / Etcd / Consul 客户端出口注入
- [x] 4.8 定义出口注入失败时的回退与日志语义

## 5. 可自定义机制
- [x] 5.1 提供协议级开关与默认策略覆盖能力
- [x] 5.2 提供基于 OpenTelemetry propagator 的自定义提取/注入扩展点（入口 + 出口）
- [x] 5.3 提供自定义 span 命名与属性增强扩展点
- [x] 5.4 明确自定义优先级与回退规则

## 6. 测试与验证
- [x] 6.1 增加 core 异步上下文连续性测试（await/定时器/事件回调）
- [x] 6.2 增加 HTTP/WS/gRPC/MQTT 入口追踪测试
- [x] 6.3 增加 Kafka/RabbitMQ/Bull/BullMQ/Commander/Cron/FaaS 等入口追踪测试
- [x] 6.4 增加 HTTP client/gRPC client/WS emit/MQTT publish/Kafka producer/RabbitMQ producer 出口注入测试
- [x] 6.5 增加 Redis/Cache/OSS/COS/Tablestore/Etcd/Consul 客户端出口注入测试
- [x] 6.6 明确并验证 Out of Scope（api-bridge、tags）不在本次改造清单
- [x] 6.7 增加自定义扩展点测试（提取、注入、命名、属性）
- [x] 6.8 运行受影响包测试（`pnpm -C <package> test`）

## 7. 文档与发布准备
- [x] 7.1 更新文档：默认行为、配置方式、扩展示例
- [x] 7.2 补充迁移说明与兼容性说明
- [x] 7.3 提供从 `@midwayjs/otel` 到 `@midwayjs/core` 的迁移清单（导入路径、配置键、装饰器）
- [x] 7.4 执行 `openspec validate add-unified-entry-async-tracing --strict --no-interactive`
