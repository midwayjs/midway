import assert from 'node:assert';
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('samples/functional-api-service smoke', () => {
  let app;

  before(async () => {
    app = await createApp({
      appDir: join(__dirname, '..'),
    });
  });

  after(async () => {
    await close(app);
  });

  it('should serve health ping', async () => {
    const result = await createHttpRequest(app).get('/api/health/ping');
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
  });

  it('should serve health echo', async () => {
    const result = await createHttpRequest(app)
      .post('/api/health/echo')
      .send({ hello: 'world' });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.body, { hello: 'world' });
  });
});
