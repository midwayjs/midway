import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🧪 Testing web-bridge ESM build...\n');

try {
  const indexPath = join(__dirname, '../dist/index.mjs');
  const vitePath = join(__dirname, '../dist/vite.mjs');
  const rspackPath = join(__dirname, '../dist/rspack.mjs');

  const main = await import(indexPath);
  const vite = await import(vitePath);
  const rspack = await import(rspackPath);

  assert.strictEqual(typeof main.createClient, 'function');
  assert.strictEqual(typeof vite.apiPlugin, 'function');
  assert.strictEqual(typeof vite.toWebSafeApiContractCode, 'function');
  assert.strictEqual(typeof rspack.apiRspackLoader, 'function');
  assert.strictEqual(typeof rspack.createApiRspackRule, 'function');
  console.log('✅ 子入口导出存在');

  const manifestClient = main.createClient({
    manifest: [
      {
        operationId: 'user.ping',
        method: 'get',
        path: '/ping',
        fullPath: '/ping',
      },
    ],
    adapter: async req => ({ op: req.operation.operationId, input: req.input }),
  });
  const response = await manifestClient.call('user.ping', { hello: 'world' });
  assert.deepStrictEqual(response, {
    op: 'user.ping',
    input: { hello: 'world' },
  });
  console.log('✅ createClient(manifest) 运行正常');

  const transformed = vite.toWebSafeApiContractCode(`
    export const user = defineApi('/user', api => ({
      get: api.get('/:id').meta({ routerName: 'getById' }).handle(() => {}),
    }), { version: '1' });
  `);
  assert.ok(transformed.includes('__midwayApiMeta'));
  assert.ok(transformed.includes('getById'));
  console.log('✅ vite transform 运行正常');

  const loaderSource = `
    export const user = defineApi('/user', api => ({
      list: api.get('/').handle(() => {}),
    }));
  `;
  const loaderOutput = rspack.apiRspackLoader.call(
    {
      resourcePath: '/tmp/demo/src/server/api/user.ts',
      getOptions: () => ({
        root: '/tmp/demo',
        apiDir: 'src/server/api',
      }),
    },
    loaderSource
  );
  assert.ok(loaderOutput.includes('__midwayApiMeta'));
  const rule = rspack.createApiRspackRule({
    root: '/tmp/demo',
    apiDir: 'src/server/api',
  });
  assert.strictEqual(rule.enforce, 'pre');
  console.log('✅ rspack loader/rule 运行正常');

  const plugin = vite.apiPlugin({ root: '/tmp/demo', apiDir: 'src/server/api' });
  assert.strictEqual(typeof plugin.resolveId, 'function');
  assert.strictEqual(typeof plugin.load, 'function');
  console.log('✅ vite apiPlugin 初始化正常');

  console.log('\n✨ web-bridge ESM 测试通过!\n');
} catch (error) {
  console.error('\n❌ web-bridge ESM 测试失败:');
  console.error(error);
  process.exit(1);
}
