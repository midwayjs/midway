import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/index.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/koa');
    app = await createApp(appDir);
  });

  afterAll(async () => {
    await close(app);
  });
  it('text code', async () => {
    const request = await createHttpRequest(app);
    const text = `t-${Date.now()}`;
    const res = await request.post('/text')
      .field('text', text)
      .expect(200)
      .then(async response => {
        return response.body;
      });
      console.log('res', res);
      assert(true);
  });
});
