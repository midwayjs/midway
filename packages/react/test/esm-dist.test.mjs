import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing react ESM build...\n');

try {
  const distPath = join(__dirname, '../dist/index.mjs');
  const pkg = await import(distPath);

  assert.strictEqual(typeof pkg.createReactApiBridge, 'function');
  assert.strictEqual(typeof pkg.createReactApiClientFromOperations, 'function');
  assert.strictEqual(typeof pkg.resolveReactApiBridgeOptions, 'function');
  assert.strictEqual(typeof pkg.MidwayApiProvider, 'function');
  assert.strictEqual(typeof pkg.useMidwayApiClient, 'function');
  console.log('✅ 核心导出存在');

  const resolved = pkg.resolveReactApiBridgeOptions();
  assert.strictEqual(resolved.transport, 'http');
  console.log('✅ resolveReactApiBridgeOptions 运行正常');

  const bridge = pkg.createReactApiBridge({
    adapter: async request => ({
      operationId: request.operation.operationId,
      input: request.input,
    }),
  });
  const bridgeResult = await bridge.invoke(
    {
      operationId: 'demo.ping',
      method: 'get',
      path: '/ping',
      fullPath: '/ping',
    },
    { ok: true }
  );
  assert.deepStrictEqual(bridgeResult, {
    operationId: 'demo.ping',
    input: { ok: true },
  });
  console.log('✅ createReactApiBridge 运行正常');

  const client = pkg.createReactApiClientFromOperations(
    [
      {
        operationId: 'demo.get',
        method: 'get',
        path: '/demo/:id',
        fullPath: '/demo/:id',
      },
    ],
    {
      adapter: async request => request.input,
    }
  );
  const value = await client.call('demo.get', { params: { id: 1 } });
  assert.deepStrictEqual(value, { params: { id: 1 } });
  console.log('✅ createReactApiClientFromOperations 运行正常');

  console.log('\n✨ react ESM 测试通过!\n');
} catch (error) {
  console.error('\n❌ react ESM 测试失败:');
  console.error(error);
  process.exit(1);
}
