# Change: 复用 Validation DTO 元数据生成 Swagger Schema

## Why
当前在 Midway 中，参数校验 DTO 与 Swagger 文档 DTO 通常需要重复标注两套装饰器：`@Rule`/class-validator 用于校验，`@ApiProperty` 用于文档。重复定义导致维护成本高、字段漂移风险高，且会降低 DTO 作为单一事实来源（SSOT）的价值。

## What Changes
- 为 Swagger 增加“从 Validation DTO 元数据推导 Schema”的能力，在 DTO 字段缺少 `@ApiProperty` 时自动补齐文档描述。
- 该能力 SHALL 面向 `@midwayjs/validation` 的多 adapter 模型（joi、zod、class-validator），并通过统一 schemaHelper 能力读取元数据。
- 首期范围优先支持 `@midwayjs/validation`，`@midwayjs/validate` 不纳入本次交付范围。
- 明确元数据优先级：`@ApiProperty` 显式定义优先，Validation 推导作为兜底。
- 规范必填/可选推导规则（required 列表）与基础类型映射（string/number/boolean/object/array）。
- 定义不支持或降级场景（复杂联合类型、自定义转换器、无法静态推导的规则）及回退策略。
- 增加配置开关，支持逐步启用，避免对现有项目文档输出造成不可控漂移。

## Impact
- Affected specs: `swagger-validation-dto-reuse`（新增）
- Affected code:
  - `packages/swagger/src/swaggerExplorer.ts`（DTO 属性解析与 schema 组装）
  - `packages/swagger/src/config/*`、`packages/swagger/src/interfaces/*`（配置与类型声明）
  - `packages/validation*/`、`packages/validate/`（仅消费公开 schemaHelper 能力，不修改其校验语义）
  - `packages/swagger/test/*`（新增/更新解析与集成测试）
- Compatibility:
  - 默认保持向后兼容（不开启或按安全默认策略运行）
  - 已声明的 `@ApiProperty` 行为不变
