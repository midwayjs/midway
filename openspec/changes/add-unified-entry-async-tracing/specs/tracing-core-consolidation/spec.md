## ADDED Requirements

### Requirement: Tracing 能力并入 Core
系统 SHALL 将原 `@midwayjs/otel` 的核心 tracing 能力并入 `@midwayjs/core`，并由 core 提供统一 tracing API。

#### Scenario: Core 提供 Trace 装饰器与服务
- **WHEN** 用户启用 tracing 能力
- **THEN** 可直接从 `@midwayjs/core` 获取 `@Trace` 与 tracing service
- **AND** 不再依赖独立 `@midwayjs/otel` 组件导入

#### Scenario: Core 提供 ctx.traceId 能力
- **WHEN** 请求上下文存在活动 trace
- **THEN** 用户可通过上下文对象读取 `traceId`
- **AND** 行为与原组件语义保持一致

### Requirement: 移除 @midwayjs/otel 包并提供迁移路径
系统 SHALL 移除独立 `@midwayjs/otel` 包，并提供清晰迁移说明。

#### Scenario: 旧导入路径需要迁移
- **WHEN** 用户代码仍引用 `@midwayjs/otel`
- **THEN** 升级说明明确给出等价的 `@midwayjs/core` 导入路径
- **AND** 指明这是 breaking change

#### Scenario: 配置与行为迁移可验证
- **WHEN** 用户按迁移说明完成配置与导入替换
- **THEN** tracing 行为与原能力保持等价或增强
