# 实施任务清单

## 1. 设计和准备
- [x] 1.1 设计通用的构建产物测试模式（适用于使用 tsup 的 validation-* 包）
- [x] 1.2 确定测试文件结构和命名约定
- [x] 1.3 研究 Node.js 原生 ESM 测试的最佳实践（.mjs 文件或 package.json type 配置）

## 2. 为 @midwayjs/validation-zod 添加测试
- [x] 2.1 创建 `packages/validation-zod/test/dist/` 目录
- [x] 2.2 实现 CJS 导入测试
- [x] 2.3 实现 ESM 导入测试（.mjs 文件或 type: module）
- [x] 2.4 验证主要导出：ZodValidationConfiguration, createZodSchema 等
- [x] 2.5 在 package.json 添加 `test:dist` 脚本
- [x] 2.6 本地运行测试验证通过

## 3. 为 @midwayjs/validation-zod4 添加测试
- [x] 3.1 创建 `packages/validation-zod4/test/dist/` 目录
- [x] 3.2 实现 CJS 导入测试
- [x] 3.3 实现 ESM 导入测试
- [x] 3.4 验证主要导出
- [x] 3.5 在 package.json 添加 `test:dist` 脚本
- [x] 3.6 本地运行测试验证通过

## 4. 为 @midwayjs/validation-joi 添加测试
- [x] 4.1 创建 `packages/validation-joi/test/dist/` 目录
- [x] 4.2 实现 CJS 导入测试
- [x] 4.3 实现 ESM 导入测试
- [x] 4.4 验证主要导出：JoiValidationConfiguration, createJoiSchema 等
- [x] 4.5 在 package.json 添加 `test:dist` 脚本
- [x] 4.6 本地运行测试验证通过

## 5. 为 @midwayjs/validation-class-validator 添加测试
- [x] 5.1 创建 `packages/validation-class-validator/test/dist/` 目录
- [x] 5.2 实现 CJS 导入测试
- [x] 5.3 实现 ESM 导入测试
- [x] 5.4 验证主要导出：ClassValidatorConfiguration 等
- [x] 5.5 在 package.json 添加 `test:dist` 脚本
- [x] 5.6 本地运行测试验证通过

## 6. CI 集成
- [x] 6.1 在根目录添加统一的 `test:dist` 脚本（通过 lerna 运行相关包）
- [ ] 6.2 在 GitHub Actions workflow 中添加构建产物测试步骤
- [ ] 6.3 确保测试在 `npm run build` 之后执行
- [ ] 6.4 验证 CI 流程正常工作

## 7. 文档和清理
- [ ] 7.1 更新贡献者指南，说明如何运行构建产物测试
- [ ] 7.2 在相关包的 README.md 中添加测试说明（可选）
- [x] 7.3 确保所有新增文件符合项目代码规范（mwts）
- [x] 7.4 运行 `npm run lint:fix` 修复格式问题

## 8. 验证和完成
- [x] 8.1 在本地运行所有 validation-* 包的完整测试套件
- [x] 8.2 验证构建产物测试覆盖所有预期场景
- [ ] 8.3 确认 CI 通过所有测试
- [ ] 8.4 代码审查和清理
