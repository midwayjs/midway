import assert from 'node:assert';
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { defineConfiguration } from '@midwayjs/core/functional';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('samples/functional-api-hybrid smoke', () => {
  let app;

  before(async () => {
    app = await createApp({
      appDir: join(__dirname, '..'),
      imports: defineConfiguration({
        namespace: 'functional-api-hybrid-test',
      }),
    });
  });

  after(async () => {
    await close(app);
  });

  it('should serve functional route', async () => {
    const result = await createHttpRequest(app).get('/api/functional/hello');
    assert.equal(result.status, 200);
    assert.equal(result.body.source, 'functional');
    assert.equal(result.body.message, 'hello from functional');
  });

  it('should serve decorator route', async () => {
    const result = await createHttpRequest(app).get('/api/legacy/hello');
    assert.equal(result.status, 200);
    assert.equal(result.body.source, 'decorator');
    assert.equal(result.body.message, 'hello from decorator');
  });
});
