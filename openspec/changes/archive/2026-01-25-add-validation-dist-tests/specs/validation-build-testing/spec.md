## ADDED Requirements

### Requirement: 构建产物 CommonJS 导入测试
使用 tsup 构建的 `validation-*` 包（validation-zod, validation-zod4, validation-joi, validation-class-validator）SHALL 包含测试，验证构建产物在 CommonJS 环境中可以正确导入和使用。

#### Scenario: CJS 环境下成功导入包
- **WHEN** 使用 `require()` 导入构建后的包
- **THEN** 包可以成功加载
- **AND** 主要导出的类、函数、常量可用
- **AND** 导出的标识符与源码一致

#### Scenario: CJS 环境下类型声明可用
- **WHEN** 在 TypeScript 项目中通过 require 使用包
- **THEN** 类型声明文件（.d.ts）可被正确解析
- **AND** TypeScript 编译器不报类型错误

### Requirement: 构建产物 ES Module 导入测试
使用 tsup 构建并支持 ESM 的 `validation-*` 包（validation-zod, validation-zod4, validation-joi, validation-class-validator）SHALL 包含测试，验证构建产物在 ES Module 环境中可以正确导入和使用。

#### Scenario: ESM 环境下成功导入包
- **WHEN** 使用 `import` 语句导入构建后的包
- **THEN** 包可以成功加载
- **AND** 主要导出的类、函数、常量可用
- **AND** 默认导出和命名导出都正常工作

#### Scenario: ESM 环境下类型声明可用
- **WHEN** 在 TypeScript ESM 项目中使用包
- **THEN** 类型声明文件（.d.mts 或 .d.ts）可被正确解析
- **AND** TypeScript 编译器不报类型错误

#### Scenario: 包的 exports 字段配置正确
- **WHEN** Node.js 解析包的导入路径
- **THEN** 根据使用环境（CJS/ESM）正确解析到对应的构建产物
- **AND** `main`, `module`, `types` 字段指向正确的文件
- **AND** `exports` 字段的条件导出配置正确

### Requirement: 构建产物测试独立执行
构建产物测试 SHALL 独立于源码单元测试，可以单独执行。

#### Scenario: 通过专用脚本运行构建产物测试
- **WHEN** 执行 `npm run test:dist` 或 `pnpm test:dist`
- **THEN** 只运行构建产物测试，不运行源码单元测试
- **AND** 测试使用构建后的 dist 目录，而非 src 目录

#### Scenario: 构建产物测试前确保构建完成
- **WHEN** 运行构建产物测试
- **THEN** 如果 dist 目录不存在或过期，提示先运行构建
- **OR** 自动执行构建后再测试

### Requirement: 测试覆盖主要导出 API
每个使用 tsup 构建的 `validation-*` 包的构建产物测试 SHALL 验证主要导出 API 的可用性。

#### Scenario: validation-zod 包导出验证
- **WHEN** 测试 `@midwayjs/validation-zod` 包
- **THEN** 验证以下导出可用：
  - `ZodValidationConfiguration` 类
  - `createZodSchema` 函数（如果有）
  - 相关的 Zod 集成工具

#### Scenario: validation-joi 包导出验证
- **WHEN** 测试 `@midwayjs/validation-joi` 包
- **THEN** 验证以下导出可用：
  - `JoiValidationConfiguration` 类
  - `createJoiSchema` 函数（如果有）
  - 相关的 Joi 集成工具

#### Scenario: validation-class-validator 包导出验证
- **WHEN** 测试 `@midwayjs/validation-class-validator` 包
- **THEN** 验证以下导出可用：
  - `ClassValidatorConfiguration` 类
  - 相关的 class-validator 集成工具

#### Scenario: validation-zod4 包导出验证
- **WHEN** 测试 `@midwayjs/validation-zod4` 包
- **THEN** 验证以下导出可用：
  - `ZodValidationConfiguration` 类
  - Zod v4 相关集成工具

### Requirement: CI 集成构建产物测试
构建产物测试 SHALL 集成到 CI/CD 流程中，在发布前自动执行。

#### Scenario: GitHub Actions 中执行构建产物测试
- **WHEN** 提交代码触发 CI 流程
- **THEN** 在运行 `npm test` 之后执行 `npm run test:dist`
- **AND** 如果构建产物测试失败，CI 流程失败
- **AND** 提供清晰的错误信息指示哪个包的哪个模块系统测试失败

#### Scenario: 本地开发环境运行所有测试
- **WHEN** 开发者运行 `npm run test` 在根目录
- **THEN** 可以选择是否包含构建产物测试
- **OR** 提供单独的命令运行所有包的构建产物测试

### Requirement: 测试文件组织结构
构建产物测试 SHALL 遵循统一的文件组织结构。

#### Scenario: 测试文件放置位置
- **WHEN** 添加构建产物测试
- **THEN** 测试文件放置在 `<package>/test/dist/` 目录下
- **AND** CJS 测试文件命名为 `test-cjs.test.ts` 或 `cjs.test.js`
- **AND** ESM 测试文件命名为 `test-esm.test.mjs` 或配置 `package.json` type 为 module

#### Scenario: 测试文件内容结构
- **WHEN** 编写构建产物测试
- **THEN** 每个测试文件包含：
  - 导入语句（require 或 import）
  - 基本的存在性检查（导出不为 undefined）
  - 类型检查（通过 typeof 或 instanceof）
  - 简单的功能性验证（如果适用）
- **AND** 测试使用清晰的描述说明测试目的
- **AND** 测试失败时提供有用的错误信息
