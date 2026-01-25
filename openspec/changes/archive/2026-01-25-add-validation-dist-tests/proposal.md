# Change: 为 validation-* 包添加构建产物测试

## Why
当前所有 `packages/validation-*` 子包缺少对构建产物（dist 目录）的测试。这些包使用不同的构建工具（tsc 或 tsup）并支持不同的模块系统（CJS 和/或 ESM），但没有测试验证构建产物在实际运行环境中的可用性。这可能导致：

1. 包配置错误（如 exports 字段、main/module 字段）未被发现
2. 模块系统兼容性问题在发布后才暴露
3. 导出的 API 在构建后不可用或名称错误
4. TypeScript 类型声明文件（.d.ts）与实际代码不匹配

添加构建产物测试可以在 CI/CD 阶段提前发现这些问题，确保包的质量和用户体验。

## What Changes
- 为每个 `validation-*` 包添加 `test/dist/` 测试目录
- 创建 CJS 和 ESM 两种环境的测试脚本
- 测试覆盖以下场景：
  - CommonJS 环境下的 `require()` 导入
  - ES Module 环境下的 `import` 导入
  - 验证主要导出的类/函数/常量可用
  - 验证类型声明文件正确生成
- 在 package.json 中添加 `test:dist` 脚本
- 在 CI 流程中集成构建产物测试

受影响的包（仅使用 tsup 构建并支持 CJS + ESM 的包）：
- `@midwayjs/validation-zod` (tsup 构建，CJS + ESM)
- `@midwayjs/validation-zod4` (tsup 构建，CJS + ESM)
- `@midwayjs/validation-joi` (tsup 构建，CJS + ESM)
- `@midwayjs/validation-class-validator` (tsup 构建，CJS + ESM)

## Impact
- **受影响的规范**: validation-build-testing (新增)
- **受影响的代码**:
  - `packages/validation-zod/test/` - 添加 dist 测试 ✅
  - `packages/validation-zod4/test/` - 添加 dist 测试 ✅
  - `packages/validation-joi/test/` - 添加 dist 测试 ⚠️ 发现 ESM bug
  - `packages/validation-class-validator/test/` - 添加 dist 测试 ✅
  - 各包的 `package.json` - 添加测试脚本 ✅
  - `.github/workflows/nodejs.yml` - 可能需要调整 CI 流程

- **向后兼容性**: 完全兼容，仅添加测试，不修改任何 API
- **测试策略**: 新增独立的构建产物测试套件，不影响现有单元测试
- **文档更新**: 无需更新用户文档，可能需要更新贡献者指南

## 重要发现

⚠️ **测试发现了 `@midwayjs/validation-joi` 的 ESM 构建问题**:
- ESM 构建中 `Joi.object is not a function` 错误
- 原因：源码使用 `import * as Joi from 'joi'`，但 joi 是 CommonJS 模块
- 影响：所有使用 ESM 导入的用户无法使用 schemaHelper 方法
- 详见：`FINDINGS.md`
