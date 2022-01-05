import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
describe.skip('test/koa.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/koa');
    try {
      app = await createApp(appDir);
    } catch (e) {
      console.log("e", e);
    }
  });

  afterAll(async () => {
    await close(app);
  });

  it('options', async () => {
    const request = await createHttpRequest(app);
    await request
      .options('/cors')
      .set('Origin', 'http://test.midwayjs.org')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://test.midwayjs.org')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect('Access-Control-Allow-Methods', 'Post');
  });

  it('get', async () => {
    const request = await createHttpRequest(app);
    await request
      .get('/cors')
      .set('Origin', 'http://test.midwayjs.org')
      .set('Access-Control-Request-Method', 'GET,POST')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'http://test.midwayjs.org')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('should not set `Access-Control-Allow-Origin` when request Origin header missing', async () => {
    const request = await createHttpRequest(app);
    await request
      .post('/cors')
      .expect(res => {
        assert(!res.headers['access-control-allow-origin']);
      })
      .expect(200);
  });


  it('jsonp callback', async () => {
    const request = await createHttpRequest(app);
    await request
      .post('/jsonp?callback=fn')
      .expect(200)
      .expect('x-content-type-options', 'nosniff')
      .expect(`/**/ typeof callback === 'function' && callback({"test":123});`)

  });
});
