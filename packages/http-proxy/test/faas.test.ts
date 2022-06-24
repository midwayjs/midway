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

  it('get to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.get('/httpbin/get?name=midway')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/get?name=midway');
        assert(response.body.args.name === 'midway');
        assert(response.body.headers['Host'] === 'httpbin.org');
      });
  });

  it('get html by host', async () => {
    const request = await createHttpRequest(app);
    await request.get('/baidu')
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.text.length);
        assert(response.text.endsWith('</html>'));
      });
  });

  it('post json to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send({name: 'midway'})
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/post');
        assert(response.body.headers['Content-Type'] === 'application/json');
        assert(response.body.data === JSON.stringify({ name: 'midway'}));
      });
  });

  it('post x-www-form-urlencoded to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send('name=midway')
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/post');
        assert(response.body.headers['Content-Type'] === 'application/x-www-form-urlencoded');
        assert(response.body.form.name === 'midway');
      });
  });
});
