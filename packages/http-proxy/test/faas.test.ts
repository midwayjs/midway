import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';

describe('test/faas.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
  })

  afterAll(async () => {
    await close(app);
  });

  it('get image by host', async () => {
    const request = await createHttpRequest(app);
    await request.get('/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png?version=123')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.headers['content-type'] === 'image/png; charset=utf-8')
        assert(response.body.length);
      });
  });

  it('get javascript by target', async () => {
    const request = await createHttpRequest(app);
    await request.get('/gcdn/mtb/lib-mtop/2.6.1/mtop.js')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.headers['content-type'] === 'application/javascript; charset=utf-8')
        assert(response.text.startsWith('!function(a,b){function c()'));
      });
  });
});
