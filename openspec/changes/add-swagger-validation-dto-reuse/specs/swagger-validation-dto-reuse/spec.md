## ADDED Requirements
### Requirement: Swagger SHALL Reuse Validation DTO Metadata
系统 SHALL 在 DTO 字段未显式声明 `@ApiProperty` 元数据时，尝试复用 Validation DTO 元数据生成 OpenAPI schema 字段。

#### Scenario: DTO 仅定义 validation 规则
- **GIVEN** 一个用于 `@Body` 或 `@Query` 的 DTO 仅定义 validation 元数据且未使用 `@ApiProperty`
- **WHEN** Swagger 生成 OpenAPI 文档
- **THEN** DTO 对应 schema SHALL 包含可推导的字段定义
- **AND** 文档生成过程不应因无法推导的单个字段失败

### Requirement: Swagger SHALL Support Validation Adapters With Consistent Baseline
系统 SHALL 支持 `@midwayjs/validation` 的 joi、zod、class-validator adapter，并在共同能力范围内输出一致语义的 OpenAPI schema。

#### Scenario: 不同 adapter 下的基础字段推导一致
- **GIVEN** 三个 DTO 分别使用 joi、zod、class-validator 描述等价的基础字段约束
- **WHEN** Swagger 生成 OpenAPI 文档
- **THEN** 三者在 type 与 required 语义上的结果 SHALL 保持一致
- **AND** adapter 特有且无法统一映射的约束 SHALL 按降级策略处理

### Requirement: Swagger SHALL Preserve ApiProperty Priority
系统 SHALL 保持 `@ApiProperty` 的显式配置优先于 validation 推导结果。

#### Scenario: DTO 同时存在 ApiProperty 与 validation 元数据
- **GIVEN** DTO 某字段同时定义 `@ApiProperty` 和 validation 规则
- **WHEN** Swagger 生成该字段 schema
- **THEN** 字段类型、格式、示例、描述与 required 语义 SHALL 优先采用 `@ApiProperty` 明确值
- **AND** validation 推导仅用于补齐 `@ApiProperty` 未定义的信息

### Requirement: Swagger SHALL Derive Required Semantics From Validation Metadata
系统 SHALL 在缺少显式 `@ApiProperty.required` 时，从 validation 元数据推导 required/optional 语义。

#### Scenario: validation 标记字段为必填
- **GIVEN** DTO 字段在 validation 元数据中被标记为必填
- **WHEN** Swagger 生成该 DTO schema
- **THEN** 该字段名 SHALL 出现在 schema.required 列表中

#### Scenario: validation 标记字段为可选
- **GIVEN** DTO 字段在 validation 元数据中被标记为可选
- **WHEN** Swagger 生成该 DTO schema
- **THEN** 该字段名 SHALL 不出现在 schema.required 列表中

### Requirement: Swagger SHALL Provide Safe Fallback For Unmappable Rules
系统 SHALL 对无法稳定映射到 OpenAPI 的 validation 规则执行安全降级，并保持文档输出可用。

#### Scenario: 复杂规则无法静态映射
- **GIVEN** DTO 字段使用复杂联合或自定义校验规则
- **WHEN** Swagger 无法稳定映射该规则
- **THEN** 系统 SHALL 回退为最小可用 schema（如 `object` 或无额外约束）
- **AND** 其余字段和路由文档生成 SHALL 正常完成

### Requirement: Swagger SHALL Offer Configurable Enablement For Validation Reuse
系统 SHALL 提供配置项控制是否启用 validation DTO 到 Swagger schema 的复用能力。

#### Scenario: 关闭复用开关
- **GIVEN** 应用配置关闭 validation DTO 复用
- **WHEN** Swagger 生成文档
- **THEN** 系统 SHALL 保持现有行为，仅依据 Swagger 装饰器元数据生成 DTO schema

#### Scenario: 开启复用开关
- **GIVEN** 应用配置开启 validation DTO 复用
- **WHEN** Swagger 生成文档
- **THEN** 系统 SHALL 对缺省字段应用 validation 元数据推导
- **AND** 不应破坏已有 `@ApiProperty` 输出
