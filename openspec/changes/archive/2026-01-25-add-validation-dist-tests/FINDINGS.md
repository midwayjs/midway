# 构建产物测试发现的问题

## 概述

在为 validation-* 包添加构建产物测试的过程中，我们发现了一些问题。

## 🐛 已发现的 Bug

### 1. validation-joi ESM 构建问题

**严重程度**: 🔴 高（ESM 构建不可用）

**问题描述**:
- `@midwayjs/validation-joi` 的 ESM 构建（`dist/index.mjs`）无法正常工作
- 调用 `schemaHelper.getSchema()` 时会抛出错误：`Joi.object is not a function`

**根本原因**:
```typescript
// src/index.ts (源码)
import * as Joi from 'joi';

// 在 ESM 环境下，joi 是 CommonJS 模块
// 导入后得到: { default: [Joi对象] }
// 所以 Joi.object 不存在，应该是 Joi.default.object
```

**影响范围**:
- 所有使用 ESM 导入 `@midwayjs/validation-joi` 的用户
- **所有调用以下方法的代码都无法工作**:
  - ❌ `getIntSchema()` - Joi.number is not a function
  - ❌ `getBoolSchema()` - Joi.boolean is not a function  
  - ❌ `getFloatSchema()` - Joi.number is not a function
  - ❌ `getStringSchema()` - Joi.string is not a function
  - ❌ `getSchema()` - Joi.object is not a function
- **以下方法正常工作**（不使用 Joi）:
  - ✅ `isRequired()`
  - ✅ `isOptional()`
  - ✅ `setRequired()`
  - ✅ `setOptional()`

**严重性评估**: 🔴🔴🔴 极高
- **5/9 个 schemaHelper 方法完全无法使用**（56% 功能损失）
- 这使得 ESM 构建**几乎无法用于实际场景**

**解决方案**:
1. **方案 A**: 修改源码导入方式
   ```typescript
   // 改为
   import Joi from 'joi';
   // 或
   import * as JoiNamespace from 'joi';
   const Joi = JoiNamespace.default || JoiNamespace;
   ```

2. **方案 B**: 在 tsup 配置中添加 banner 处理
   ```typescript
   // tsup.config.ts
   export default defineConfig({
     // ...
     banner: {
       js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
     },
   });
   ```

3. **方案 C**: 标记 ESM 为 experimental 或在文档中说明

**验证方法**:
```bash
cd packages/validation-joi
pnpm build
node test/dist/esm.test.mjs
```

**测试输出**:
```
🔍 深度测试：调用所有 schemaHelper 方法...
❌ getIntSchema() 失败: Joi.number is not a function
❌ getBoolSchema() 失败: Joi.boolean is not a function
❌ getFloatSchema() 失败: Joi.number is not a function
❌ getStringSchema() 失败: Joi.string is not a function
❌ getSchema() 失败: Joi.object is not a function
✅ isRequired() 正常
✅ isOptional() 正常
✅ setRequired() 正常
✅ setOptional() 正常

⚠️  发现 ESM 构建问题：
📝 原因：源码使用 import * as Joi from 'joi'，但 joi 是 CommonJS 模块
🔧 解决方案：需要在源码中改为 import Joi from 'joi' 或处理 .default

失败的方法:
  - getIntSchema: Joi.number is not a function
  - getBoolSchema: Joi.boolean is not a function
  - getFloatSchema: Joi.number is not a function
  - getStringSchema: Joi.string is not a function
  - getSchema: Joi.object is not a function

❌ ESM 构建测试失败（已知 bug）
```

---

## ✅ 通过测试的包

以下包的 CJS 和 ESM 构建都正常工作：

### 1. @midwayjs/validation-zod
- ✅ CJS 构建正常
- ✅ ESM 构建正常
- ✅ 所有导出可用
- ✅ validateServiceHandler 可调用

### 2. @midwayjs/validation-zod4
- ✅ CJS 构建正常
- ✅ ESM 构建正常
- ✅ 所有导出可用
- ✅ validateServiceHandler 可调用

### 3. @midwayjs/validation-joi
- ✅ CJS 构建正常
- ❌ ESM 构建有问题（见上述 bug）
- ✅ 基础导出可用
- ⚠️  schemaHelper 方法在 ESM 中不可用

### 4. @midwayjs/validation-class-validator
- ✅ CJS 构建正常
- ✅ ESM 构建正常
- ✅ 所有导出可用
- ✅ validateServiceHandler 可调用

---

## 📊 测试覆盖率

| 包名 | CJS 测试 | ESM 测试 | 深度测试 | 状态 |
|------|---------|---------|---------|------|
| validation-zod | ✅ | ✅ | ✅ | 通过 |
| validation-zod4 | ✅ | ✅ | ✅ | 通过 |
| validation-joi | ✅ | ❌ | ❌ | 失败 |
| validation-class-validator | ✅ | ✅ | ✅ | 通过 |

---

## 🎯 测试价值

通过添加构建产物测试并**测试每个方法的实际调用**（而不只是检查存在性），我们成功：

1. ✅ 发现了 validation-joi 的 **5 个关键方法完全无法工作**（在用户使用前）
2. ✅ 验证了其他 3 个包的构建产物都能正常工作
3. ✅ 确保了 tsup 正确处理了 `require()` 调用（通过 `__commonJS` 包装器）
4. ✅ 提供了一个可重复的测试框架，未来可以防止类似问题
5. ✅ 证明了**浅层测试不够** - 必须实际调用方法才能发现问题

---

## 📝 建议

1. **立即修复**: 修复 validation-joi 的 ESM 构建问题
2. **文档说明**: 在发布说明中标注 validation-joi 的 ESM 支持状态
3. **持续集成**: 将构建产物测试加入 CI 流程
4. **扩展测试**: 考虑为其他使用 tsup 的包也添加类似测试
