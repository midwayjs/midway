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
    const setRes = await request.post('/text')
      .send({ text })
      .expect(200)
      .then(async response => {
        return response.body;
      });
    const checkRes = await request.post('/check')
      .send({ id: setRes.id, code: text })
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert(checkRes === true);
    const imgRes = await request.get('/img')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert(imgRes.id && imgRes.imageBase64);

      const formulaRes = await request.get('/formula')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert(formulaRes.id && formulaRes.imageBase64);

      const textCodeRes = await request.get('/text')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert(textCodeRes.id && textCodeRes.text);
      const textCheckRes = await request.post('/check')
      .send({ id: textCodeRes.id, code: textCodeRes.text })
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert(textCheckRes === true);
  });
});
