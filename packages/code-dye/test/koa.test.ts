import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
describe('test/koa.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/koa');
    try {
      app = await createApp(appDir);
    } catch (e) {
      console.log('e', e);
    }
  });

  afterAll(async () => {
    await close(app);
  });

  it('json', async () => {
    const request = await createHttpRequest(app);
    const res = await request.get('/test?codeDye=json').then(res => res.text);
    const json = JSON.parse(res);
    assert(json.call[0].call[3].paths[2] === '[async func] firstName');
    assert(json.call[0].call[3].end.result === 'test');
  });

  it('html', async () => {
    const request = await createHttpRequest(app);
    const res = await request.get('/test?codeDye=html').then(res => res.text);
    assert(res && res.length > 0);
  });
});
