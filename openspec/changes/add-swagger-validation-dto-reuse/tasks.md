## 1. Specification
- [x] 1.1 明确 Swagger 与 Validation DTO 元数据合并优先级与降级规则
- [x] 1.2 明确首期支持范围（仅 `@midwayjs/validation` 的 joi/zod/class-validator 共同子集：基础类型、required 推导、复杂规则降级）
- [x] 1.3 明确配置开关与默认行为（兼容策略）

## 2. Implementation
- [x] 2.1 在 `@midwayjs/swagger` 增加 validation DTO schema 推导入口（仅字段缺省时补齐）
- [x] 2.2 实现 required/optional 推导并与现有 `@ApiProperty` 逻辑合并
- [x] 2.3 增加 DTO 推导缓存，避免重复解析
- [x] 2.4 增加配置项与类型声明，并接入组件默认配置

## 3. Validation & Tests
- [x] 3.1 为纯 validation DTO 场景增加 parser 单测（joi/zod/class-validator 各 1 组）
- [x] 3.2 为 `@ApiProperty` + validation 混用场景增加优先级单测
- [x] 3.3 为复杂规则降级场景增加回退单测
- [x] 3.4 运行 `pnpm -C packages/swagger test` 并确保通过

## 4. Documentation
- [x] 4.1 更新 `site/docs/extensions/swagger.md`，新增“复用 validation DTO”章节
- [x] 4.2 记录已支持映射、限制项和迁移建议
