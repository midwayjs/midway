/**
 * ES Module 构建产物导入测试
 * 验证 dist/index.mjs 可以在 ESM 环境下正确导入和使用
 */

import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MidwayConfigService, MidwayEnvironmentService } from '@midwayjs/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing validation-zod ESM build...\n');

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

  const configService = {
    addObject: () => {},
  };
  const environmentService = {
    getModuleLoadType: () => undefined,
  };
  const validationService = await pkg.default.validateServiceHandler({
    get: token => {
      if (token === MidwayEnvironmentService) {
        return environmentService;
      }
      if (token === MidwayConfigService) {
        return configService;
      }
      throw new Error(`Unknown token: ${String(token)}`);
    },
  });
  assert.strictEqual(
    typeof validationService.validateWithSchema,
    'function',
    'validateServiceHandler 应该返回验证服务实例'
  );
  console.log('✅ validateServiceHandler 可在 ESM 环境执行');

  assert.ok(pkg.default.schemaHelper, 'schemaHelper 应该存在');
  console.log('✅ schemaHelper 对象存在');

  const { schemaHelper } = pkg.default;
  class TestDTO {}

  // 测试每个方法（实际调用）
  console.log('\n🔍 深度测试：调用所有方法...');
  let passed = 0;
  let failed = 0;

  const tests = [
    { name: 'getIntSchema', fn: () => schemaHelper.getIntSchema() },
    { name: 'getBoolSchema', fn: () => schemaHelper.getBoolSchema() },
    { name: 'getFloatSchema', fn: () => schemaHelper.getFloatSchema() },
    { name: 'getStringSchema', fn: () => schemaHelper.getStringSchema() },
    { name: 'getSchema', fn: () => schemaHelper.getSchema(TestDTO) },
    { name: 'isRequired', fn: () => schemaHelper.isRequired(TestDTO, 'test'), canReturnUndefined: true },
    { name: 'isOptional', fn: () => schemaHelper.isOptional(TestDTO, 'test'), canReturnUndefined: true },
    { name: 'setRequired', fn: () => schemaHelper.setRequired(TestDTO, 'test'), noReturn: true },
    { name: 'setOptional', fn: () => schemaHelper.setOptional(TestDTO, 'test'), noReturn: true },
  ];

  for (const test of tests) {
    try {
      const result = test.fn();
      if (!test.noReturn && !test.canReturnUndefined) {
        assert.ok(result !== undefined, `${test.name} 应该有返回值`);
      }
      console.log(`✅ ${test.name}()`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}():`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 结果: ${passed}/${tests.length} 通过`);

  if (failed > 0) {
    console.error('\n❌ 部分方法测试失败\n');
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
