## ADDED Requirements

### Requirement: 提供可配置的入口追踪策略
系统 SHALL 允许用户按协议配置入口与出口追踪行为，包括启停、命名策略与透传策略。

#### Scenario: 按协议关闭默认入口追踪
- **WHEN** 用户禁用某一协议（如 WebSocket）的入口追踪
- **THEN** 系统不为该协议自动创建根 span
- **AND** 其他协议保持默认行为不受影响

#### Scenario: 按协议关闭默认出口注入
- **WHEN** 用户禁用某一协议（如 MQTT）的出口追踪注入
- **THEN** 系统不为该协议自动注入追踪上下文
- **AND** 其他协议出口保持默认行为不受影响

#### Scenario: 自定义 span 命名策略
- **WHEN** 用户配置自定义命名策略
- **THEN** 系统按该策略生成入口 span 名称
- **AND** 未覆盖场景回退到默认命名规则

### Requirement: 提供自定义提取与注入扩展点
系统 SHALL 提供可插拔扩展点，允许用户基于 OpenTelemetry propagator 或自定义策略实现追踪上下文提取与回传注入逻辑。

#### Scenario: 自定义请求字段提取追踪上下文
- **WHEN** 用户注册自定义提取器并定义私有字段规则
- **THEN** 系统优先使用自定义提取逻辑恢复追踪上下文
- **AND** 提取失败时回退默认策略

#### Scenario: 替换默认 OpenTelemetry propagator
- **WHEN** 用户注册自定义 OpenTelemetry propagator
- **THEN** 系统使用该 propagator 执行提取与注入
- **AND** 未注册时使用默认 W3C Trace Context propagator

#### Scenario: 自定义响应回传注入逻辑
- **WHEN** 用户注册自定义注入器
- **THEN** 系统按用户逻辑写入响应头、metadata 或会话上下文
- **AND** 保持协议兼容边界不被破坏

### Requirement: 提供可扩展的追踪属性增强能力
系统 SHALL 允许用户在入口追踪 span 上追加统一业务属性。

#### Scenario: 追加业务标签属性
- **WHEN** 用户配置属性增强器（如 tenantId、region）
- **THEN** 每个入口 span 在创建后追加这些业务属性

### Requirement: 明确扩展优先级与失败回退
系统 SHALL 定义用户扩展与默认逻辑的优先级，并在扩展执行失败时安全回退。

#### Scenario: 自定义扩展异常时安全回退
- **WHEN** 自定义提取器或注入器抛出异常
- **THEN** 系统记录错误并回退到默认实现
- **AND** 请求主流程不中断
