import { createHttpRequest, close, createApp, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as captcha from '../src';
import { sleep } from '@midwayjs/core';

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
      assert.ok(checkRes === true);
    const imgRes = await request.get('/img')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert.ok(imgRes.id && imgRes.imageBase64);

      const formulaRes = await request.get('/formula')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert.ok(formulaRes.id && formulaRes.imageBase64);

      const textCodeRes = await request.get('/text')
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert.ok(textCodeRes.id && textCodeRes.text);
      const textCheckRes = await request.post('/check')
      .send({ id: textCodeRes.id, code: textCodeRes.text })
      .expect(200)
      .then(async response => {
        return response.body;
      });
      assert.ok(textCheckRes === true);
  });

  it('test CaptchaService cache with seconds', async () => {
    const app = await createLightApp('', {
      imports: [captcha],
      globalConfig: {
        captcha: {
          expirationTime: 1,
        },
      }
    });

    const captchaService = await app.getApplicationContext().getAsync(captcha.CaptchaService);

    const id = await captchaService.set('123');
    expect(await captchaService.check(id, '123')).toBeTruthy();
    await sleep(1000);
    expect(await captchaService.check(id, '123')).toBeFalsy();
    await close(app);
  });
});
