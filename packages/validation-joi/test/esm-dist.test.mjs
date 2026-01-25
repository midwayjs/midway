/**
 * ES Module 构建产物导入测试
 * 验证 dist/index.mjs 可以在 ESM 环境下正确导入和使用
 */

import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing validation-joi ESM build...\n');

try {
  const distPath = join(__dirname, '../dist/index.mjs');
  console.log(`📦 Loading package from: ${distPath}`);
  const pkg = await import(distPath);

  assert.ok(pkg, '包应该导出内容');
  assert.ok(pkg.default, '包应该有 default 导出');
  console.log('✅ 默认导出存在');

  assert.strictEqual(
    typeof pkg.default.validateServiceHandler,
    'function',
    'validateServiceHandler 应该是一个函数'
  );
  console.log('✅ validateServiceHandler 是函数');

  assert.ok(pkg.default.schemaHelper, 'schemaHelper 应该存在');
  assert.strictEqual(
    typeof pkg.default.schemaHelper,
    'object',
    'schemaHelper 应该是一个对象'
  );
  console.log('✅ schemaHelper 对象存在');

  const { schemaHelper } = pkg.default;
  const methods = ['isRequired', 'isOptional', 'setRequired', 'setOptional', 'getSchema', 
                   'getIntSchema', 'getBoolSchema', 'getFloatSchema', 'getStringSchema'];
  
  for (const method of methods) {
    assert.strictEqual(
      typeof schemaHelper[method],
      'function',
      `schemaHelper.${method} 应该是函数`
    );
  }
  console.log('✅ schemaHelper 所有方法都存在');

  // 深度测试：验证 validateServiceHandler 可以被调用
  console.log('\n🔍 深度测试：验证实际调用...');
  const mockContainer = {
    get() {
      return { addObject() {} };
    }
  };
  const service = pkg.default.validateServiceHandler(mockContainer);
  assert.ok(service, 'validateServiceHandler 应该返回服务实例');
  console.log('✅ validateServiceHandler 可以正常调用（tsup 正确转换了 require）');

  // 创建一个测试类
  class TestDTO {}

  // 测试每个 schemaHelper 方法
  console.log('\n🔍 深度测试：调用所有 schemaHelper 方法...');
  let hasErrors = false;
  const errors = [];

  // 1. getIntSchema
  try {
    const intSchema = schemaHelper.getIntSchema();
    assert.ok(intSchema, 'getIntSchema 应该返回 schema');
    console.log('✅ getIntSchema() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'getIntSchema', error: error.message });
    console.error('❌ getIntSchema() 失败:', error.message);
  }

  // 2. getBoolSchema
  try {
    const boolSchema = schemaHelper.getBoolSchema();
    assert.ok(boolSchema, 'getBoolSchema 应该返回 schema');
    console.log('✅ getBoolSchema() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'getBoolSchema', error: error.message });
    console.error('❌ getBoolSchema() 失败:', error.message);
  }

  // 3. getFloatSchema
  try {
    const floatSchema = schemaHelper.getFloatSchema();
    assert.ok(floatSchema, 'getFloatSchema 应该返回 schema');
    console.log('✅ getFloatSchema() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'getFloatSchema', error: error.message });
    console.error('❌ getFloatSchema() 失败:', error.message);
  }

  // 4. getStringSchema
  try {
    const stringSchema = schemaHelper.getStringSchema();
    assert.ok(stringSchema, 'getStringSchema 应该返回 schema');
    console.log('✅ getStringSchema() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'getStringSchema', error: error.message });
    console.error('❌ getStringSchema() 失败:', error.message);
  }

  // 5. getSchema
  try {
    const schema = schemaHelper.getSchema(TestDTO);
    assert.ok(schema, 'getSchema 应该返回 schema');
    console.log('✅ getSchema() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'getSchema', error: error.message });
    console.error('❌ getSchema() 失败:', error.message);
  }

  // 6. isRequired
  try {
    const result = schemaHelper.isRequired(TestDTO, 'testProp');
    assert.strictEqual(typeof result, 'boolean', 'isRequired 应该返回 boolean');
    console.log('✅ isRequired() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'isRequired', error: error.message });
    console.error('❌ isRequired() 失败:', error.message);
  }

  // 7. isOptional
  try {
    const result = schemaHelper.isOptional(TestDTO, 'testProp');
    assert.strictEqual(typeof result, 'boolean', 'isOptional 应该返回 boolean');
    console.log('✅ isOptional() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'isOptional', error: error.message });
    console.error('❌ isOptional() 失败:', error.message);
  }

  // 8. setRequired
  try {
    schemaHelper.setRequired(TestDTO, 'testProp');
    console.log('✅ setRequired() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'setRequired', error: error.message });
    console.error('❌ setRequired() 失败:', error.message);
  }

  // 9. setOptional
  try {
    schemaHelper.setOptional(TestDTO, 'testProp');
    console.log('✅ setOptional() 正常');
  } catch (error) {
    hasErrors = true;
    errors.push({ method: 'setOptional', error: error.message });
    console.error('❌ setOptional() 失败:', error.message);
  }

  if (hasErrors) {
    console.error('\n⚠️  发现 ESM 构建问题：');
    console.error('📝 原因：源码使用 import * as Joi from \'joi\'，但 joi 是 CommonJS 模块');
    console.error('🔧 解决方案：需要在源码中改为 import Joi from \'joi\' 或处理 .default');
    console.error('\n失败的方法:');
    errors.forEach(({ method, error }) => {
      console.error(`  - ${method}: ${error}`);
    });
    console.error('\n❌ ESM 构建测试失败（已知 bug）\n');
    process.exit(1);
  }

  console.log('\n✨ 所有 ESM 测试通过!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ ESM 测试失败:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
