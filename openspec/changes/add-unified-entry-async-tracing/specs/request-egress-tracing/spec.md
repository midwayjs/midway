## ADDED Requirements

### Requirement: 全协议出口自动注入追踪上下文
系统 SHALL 在框架托管的出口调用中自动注入当前 OpenTelemetry 追踪上下文，覆盖 HTTP client、gRPC client、WebSocket emit、MQTT publish、Kafka/RabbitMQ producer、Bull/BullMQ producer 及同类出口。

#### Scenario: HTTP client 自动注入追踪上下文
- **WHEN** 在请求上下文中发起 HTTP client 调用
- **THEN** 系统自动注入 W3C Trace Context 到请求头

#### Scenario: gRPC client 自动注入追踪上下文
- **WHEN** 在请求上下文中发起 gRPC client 调用
- **THEN** 系统自动注入追踪上下文到 gRPC metadata

#### Scenario: WebSocket emit 自动注入追踪上下文
- **WHEN** 在请求上下文中发起 WebSocket emit
- **THEN** 系统自动将追踪上下文注入事件元信息或约定字段

#### Scenario: MQTT publish 自动注入追踪上下文
- **WHEN** 在请求上下文中发起 MQTT publish
- **THEN** 系统自动将追踪上下文注入消息属性或约定字段

#### Scenario: Kafka 与 RabbitMQ producer 自动注入追踪上下文
- **WHEN** 在请求上下文中发起 Kafka 或 RabbitMQ 消息发送
- **THEN** 系统自动将追踪上下文注入消息 headers

#### Scenario: Bull 与 BullMQ producer 自动注入追踪上下文
- **WHEN** 在请求上下文中调用 `addJobToQueue` 或 `runJob`
- **THEN** 系统自动将追踪上下文注入 job metadata 或约定字段

#### Scenario: 通用 ServiceFactory 客户端出口注入
- **WHEN** 在请求上下文中通过框架管理客户端发起外部调用（如 Redis/OSS/COS/Tablestore/Etcd/Consul）
- **THEN** 系统按客户端能力注入追踪上下文或关联标识

### Requirement: 出口注入失败时安全回退
出口注入异常 SHALL 不中断业务调用，系统应回退为不注入并记录可诊断日志。

#### Scenario: 注入器异常不影响业务调用
- **WHEN** 某次出口调用的注入过程抛出异常
- **THEN** 业务出口调用继续执行
- **AND** 系统记录注入失败日志并标注协议类型
