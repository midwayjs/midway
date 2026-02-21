## ADDED Requirements

### Requirement: 全入口自动创建请求根追踪上下文
系统 SHALL 基于 OpenTelemetry 在受支持入口（包括 HTTP、WebSocket、gRPC、MQTT 及同类协议入口）自动创建或恢复请求级根追踪上下文，并在请求处理完成后正确结束。

#### Scenario: HTTP 入口自动创建或恢复根 span
- **WHEN** 一个 HTTP 请求进入 Midway 请求入口
- **THEN** 系统自动创建或恢复当前请求的根 span
- **AND** 在请求处理结束时完成 span 结束与状态标记

#### Scenario: WebSocket 入口创建连接/消息追踪上下文
- **WHEN** WebSocket 连接建立或消息处理开始
- **THEN** 系统为连接级或消息级处理创建或恢复追踪上下文
- **AND** 保证消息处理完成后生命周期正确结束

#### Scenario: gRPC 入口自动创建或恢复根 span
- **WHEN** 一个 gRPC 调用进入服务端入口
- **THEN** 系统自动创建或恢复当前调用的根 span
- **AND** 在调用完成时记录状态并结束 span

#### Scenario: MQTT 入口自动创建或恢复根 span
- **WHEN** 一个 MQTT 消息进入订阅处理入口
- **THEN** 系统自动创建或恢复当前消息处理的根 span
- **AND** 在消息处理完成时记录状态并结束 span

### Requirement: 请求追踪上下文在异步链路中连续
系统 SHALL 在入口处理流程中的异步边界维持同一追踪上下文，避免 traceId/span 在异步流程中丢失。

#### Scenario: await/Promise 链路上下文连续
- **WHEN** 请求处理逻辑包含 `await` 或 Promise 链式调用
- **THEN** 后续异步步骤可读取与入口一致的 trace 上下文

#### Scenario: 定时器与事件回调上下文连续
- **WHEN** 请求处理过程中触发定时器或事件回调
- **THEN** 回调内仍可读取请求入口追踪上下文

### Requirement: 协议级追踪上下文透传与回传
系统 SHALL 使用 OpenTelemetry Propagation API 提取与注入追踪上下文，并按协议能力回传追踪标识，保证端到端链路可关联。

#### Scenario: 从标准与兼容字段提取上下文
- **WHEN** 入口请求携带 W3C Trace Context（`traceparent`/`tracestate`）或兼容标识（如 `x-trace-id`）
- **THEN** 系统优先恢复该追踪上下文并继续处理

#### Scenario: HTTP 响应回传追踪标识
- **WHEN** HTTP 请求处理完成
- **THEN** 系统在响应中写入可关联追踪的标识信息

#### Scenario: gRPC 与 WebSocket 回传追踪标识
- **WHEN** gRPC 或 WebSocket 请求完成
- **THEN** 系统通过协议支持的 metadata 或上下文映射回传追踪标识

#### Scenario: MQTT 消息链路携带追踪标识
- **WHEN** MQTT 入口消息处理并转发或回推下游消息
- **THEN** 系统可按协议能力携带可关联的追踪标识

### Requirement: 追踪失败不影响业务主流程
追踪组件异常或上下文恢复失败 SHALL 不中断业务请求执行，系统应降级为最小可用模式。

#### Scenario: 追踪初始化失败时业务仍可执行
- **WHEN** 某次请求的追踪初始化出现异常
- **THEN** 请求处理流程继续执行
- **AND** 系统记录可诊断错误信息
