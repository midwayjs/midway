import assert from 'node:assert';
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('samples/react-hybrid-api smoke', () => {
  let app;

  before(async () => {
    app = await createApp({
      appDir: join(__dirname, '..'),
      baseDir: join(__dirname, '../src/server'),
    });
  });

  after(async () => {
    await close(app);
  });

  it('should get user by functional route', async () => {
    const result = await createHttpRequest(app).get('/api/users/1');
    assert.equal(result.status, 200);
    assert.equal(result.body.id, '1');
    assert.equal(result.body.name, 'harry');
  });

  it('should get controller route', async () => {
    const result = await createHttpRequest(app).get('/api/controller-route/hello');
    assert.equal(result.status, 200);
    assert.equal(result.body.message, 'hello from controller route');
  });
});
