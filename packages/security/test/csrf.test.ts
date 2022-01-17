
import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/csrf.test.ts', function () {
  let koaApp;
  beforeAll(async () => {
    const koaAppDir = join(__dirname, 'fixtures/koa-csrf');
    koaApp = await createApp(koaAppDir);
  });

  afterAll(async () => {
    await close(koaApp);
  });
  it('post with csrf token', async () => {
    const request = await createHttpRequest(koaApp);
    const response = await request.get('/csrf').expect(200);
    const csrfToken = response.text;
    assert(response.text);
    const body = {
      _csrf: csrfToken,
      test: Date.now()
    };
    await request.post('/body')
      .set('Cookie', response.headers['set-cookie'])
      .send(body)
      .expect(200)
      .expect(body);
  });

  it('post with csrf token rotate', async () => {
    const request = await createHttpRequest(koaApp);
    const preResponse = await request.get('/csrf').expect(200);
    const response = await request.get('/rotate').expect(200);
    const csrfToken = response.text;
    assert(response.text && preResponse.text !== response.text);
    const body = {
      _csrf: csrfToken,
      test: Date.now()
    };
    await request.post('/body')
      .set('Cookie', response.headers['set-cookie'])
      .send(body)
      .expect(200)
      .expect(body);
  });
});
