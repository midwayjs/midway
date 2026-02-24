import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing vue ESM build...\n');

try {
  const distPath = join(__dirname, '../dist/index.mjs');
  const pkg = await import(distPath);

  assert.strictEqual(typeof pkg.createClient, 'function');
  assert.strictEqual(typeof pkg.createMidwayApiPlugin, 'function');
  assert.ok(pkg.MidwayApiProvider);
  assert.strictEqual(typeof pkg.useMidwayApiClient, 'function');
  assert.strictEqual(typeof pkg.useMidwayApiOperation, 'function');
  console.log('✅ 核心导出存在');

  const client = pkg.createClient(
    {
      user: {
        get: {
          method: 'get',
          path: '/user/:id',
        },
      },
    },
    {
      manifest: false,
      adapter: async request => ({
        operationId: request.operation.operationId,
        input: request.input,
      }),
    }
  );
  const result = await client.user.get({ params: { id: 1 } });
  assert.deepStrictEqual(result, {
    operationId: 'user.get',
    input: { params: { id: 1 } },
  });
  console.log('✅ createClient 运行正常');

  const plugin = pkg.createMidwayApiPlugin({
    transport: 'http',
    call: async () => null,
    has: () => false,
    operationIds: () => [],
  });
  assert.strictEqual(typeof plugin.install, 'function');
  console.log('✅ createMidwayApiPlugin 运行正常');

  const setup = pkg.MidwayApiProvider?.setup;
  assert.strictEqual(typeof setup, 'function');
  console.log('✅ MidwayApiProvider 结构正常');

  console.log('\n✨ vue ESM 测试通过!\n');
} catch (error) {
  console.error('\n❌ vue ESM 测试失败:');
  console.error(error);
  process.exit(1);
}
