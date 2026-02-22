## Context
Midway 已有两条并行能力链：
- 文档链：`@midwayjs/swagger` 通过 `@ApiProperty` 元数据构造 OpenAPI Schema。
- 校验链：`@midwayjs/validation`（多 validator）与 `@midwayjs/validate`（Joi）通过 DTO 元数据执行运行时校验。

当前 Swagger 的 DTO 解析只消费 swagger 装饰器元数据，导致校验 DTO 无法直接复用为文档 DTO。

## Goals / Non-Goals
- Goals:
  - 在不破坏现有 Swagger 行为的前提下，复用 Validation DTO 元数据生成 schema。
  - 在 `@midwayjs/validation` 的 joi、zod、class-validator adapter 下提供一致的“最低保证”推导语义。
  - 将 DTO 字段的 required/optional 从校验规则推导到 OpenAPI required。
  - 给出稳定优先级与回退策略，确保结果可预测。
- Non-Goals:
  - 不在本变更中实现完整的任意校验规则到 OpenAPI 的 1:1 语义映射。
  - 不改变 Validation/Validate 组件本身的校验行为。
  - 不在首期纳入 `@midwayjs/validate`（Joi 独立组件）的复用支持。
  - 不处理与 DTO 无关的路由注解（如 security/response）自动推导。

## Decisions
- Decision: 采用“swagger 显式优先，validation 推导兜底”的合并策略。
  - Rationale: 保护现有用户对文档精细控制能力，避免推导结果覆盖手工文档。
- Decision: 通过统一抽象层读取 validator 的 schema/required 能力，而不是在 swagger 中硬编码某个 validator 实现。
  - Rationale: `@midwayjs/validation` 已提供 `schemaHelper` 能力，便于统一接入与扩展。
- Decision: 将多 adapter 行为定义为“共同子集优先”，对 adapter 特有高级语义不做强制统一。
  - Rationale: joi/zod/class-validator 表达能力与元数据结构差异明显，先保证一致性最小集更稳妥。
- Decision: 增加配置开关（建议为 `swagger.useValidationSchema`），默认安全值保持当前体验。
  - Rationale: 该变更可能影响输出 schema，需可渐进启用。

## Mapping Strategy (High-level)
- 字段来源：
  - 如果字段有 `@ApiProperty`，按现有逻辑直接使用。
  - 如果无 `@ApiProperty`，尝试从 validation schema 推导字段类型与 required。
- required 规则：
  - 优先读 swagger `required`。
  - 否则使用 validator 的 `isRequired/isOptional` 推导。
- 类型映射：
  - 仅承诺基础类型和常见对象/数组推导；复杂场景回退到 `object` 或保持空 schema。
  - 在 joi/zod/class-validator 三类 adapter 下，以上映射语义保持一致；无法一致映射的能力标记为降级项。

## Risks / Trade-offs
- 风险: 各 validator（Joi/Zod/class-validator）可表达能力差异大，推导精度不一致。
  - Mitigation: 先定义“最低保证映射”，超出范围的规则显式降级。
- 风险: 开启后可能导致 schema 与历史快照不同。
  - Mitigation: 提供配置开关、补充快照测试与迁移说明。
- 风险: Swagger 解析阶段可能增加计算开销。
  - Mitigation: 以 DTO 级缓存复用推导结果，避免重复计算。

## Migration Plan
1. 引入开关并默认安全行为。
2. 增加测试覆盖：纯 `@ApiProperty`、纯 validation DTO、混合 DTO、边界回退。
3. 文档新增“复用 DTO”章节，说明优先级、限制和推荐实践。

## Open Questions
- 开关默认值是否应在下一个大版本再切为开启。
