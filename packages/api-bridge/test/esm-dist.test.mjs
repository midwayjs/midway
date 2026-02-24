import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing api-bridge ESM build...\n');

try {
  const distPath = join(__dirname, '../dist/index.mjs');
  const pkg = await import(distPath);

  assert.strictEqual(typeof pkg.createApiClientDefinition, 'function');
  assert.strictEqual(typeof pkg.createApiClient, 'function');
  assert.strictEqual(typeof pkg.createClient, 'function');
  assert.strictEqual(typeof pkg.createAxiosAdapter, 'function');
  console.log('✅ 核心导出存在');

  const operations = [
    {
      operationId: 'user.get',
      method: 'get',
      path: '/user/:id',
      fullPath: '/user/:id',
    },
  ];
  const definition = pkg.createApiClientDefinition(operations);
  const client = pkg.createApiClient(definition, {
    adapter: async request => {
      return {
        operationId: request.operation.operationId,
        input: request.input,
      };
    },
  });

  const output = await client.call('user.get', { params: { id: 1 } });
  assert.deepStrictEqual(output, {
    operationId: 'user.get',
    input: { params: { id: 1 } },
  });
  console.log('✅ createApiClient 运行正常');

  const axiosAdapter = pkg.createAxiosAdapter({
    request: async config => {
      return {
        status: 200,
        data: config,
      };
    },
  });
  const axiosResult = await axiosAdapter({
    operation: operations[0],
    input: { params: { id: 2 } },
  });
  assert.strictEqual(axiosResult.url, '/user/2');
  console.log('✅ createAxiosAdapter 运行正常');

  const manifestClient = pkg.createClient({
    manifest: [
      {
        operationId: 'manifest.ping',
        method: 'get',
        path: '/ping',
        fullPath: '/ping',
      },
    ],
    adapter: async request => request.operation.operationId,
  });
  const manifestResult = await manifestClient.call('manifest.ping', {});
  assert.strictEqual(manifestResult, 'manifest.ping');
  console.log('✅ createClient(manifest) 运行正常');

  console.log('\n✨ api-bridge ESM 测试通过!\n');
} catch (error) {
  console.error('\n❌ api-bridge ESM 测试失败:');
  console.error(error);
  process.exit(1);
}
