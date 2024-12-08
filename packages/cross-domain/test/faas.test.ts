import { createHttpRequest, close, createLegacyFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import { BootstrapStarter } from '../../../packages-serverless/midway-fc-starter/src';
import * as assert from 'assert';
describe('test/faas.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    try {
      app = await createLegacyFunctionApp(appDir, {starter: new BootstrapStarter()});
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

  it('should not set `Access-Control-Allow-Origin` when request Origin header missing', async () => {
    const request = await createHttpRequest(app);
    await request
      .post('/cors')
      .expect(res => {
        assert.ok(!res.headers['access-control-allow-origin']);
      })
      .expect(200);
  });
});
