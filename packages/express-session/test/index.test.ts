import { createApp, createHttpRequest, close } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/index.test.ts', function () {

  it('should test sessionStore', async () => {
    const app = await createApp(join(__dirname, 'fixtures/memory-session'));
    const request = createHttpRequest(app);

    await request.get('/set?foo=bar')
      .expect(200)
      .expect('set-cookie', /MW_SESS=.*?;/);

    await close(app);
  });

  describe('should test cookie session', () => {

    let app;
    let request;
    beforeAll(async () => {
      app = await createApp(join(__dirname, 'fixtures/cookie-session'));
      request = createHttpRequest(app);
    })

    afterAll(async () => {
      await close(app);
    })

    it('should get cookie session', async () => {
      await request
        .get('/set?foo=bar')
        .expect(200)
        .expect({ foo: 'bar' })
        .expect('set-cookie', /MW_SESS=.*?;/);
    });

    it('should get empty session and do not set cookie when session not populated', async () => {
      await request
        .get('/get')
        .expect(200)
        // .expect({})
        .expect(res => {
          assert(!res.header['set-cookie']?.join('').match(/MW_SESS/));
        });
    });

    it('should ctx.session= change the session', async () => {
      await request
        .get('/set?foo=bar')
        .expect(200)
        .expect({ foo: 'bar' })
        .expect('set-cookie', /MW_SESS=.*?;/);
    });

    it('should ctx.session.key= change the session', async () => {
      const result = await request
        .get('/set?key=foo&foo=bar')
        .expect(200)
        .expect({ key: 'foo', foo: 'bar' })
        .expect('set-cookie', /MW_SESS=.*?;/);

      await request
        .get('/setKey?key=bar')
        .set({
          cookie: result.headers['set-cookie']
        })
        .expect(200)
        .expect({ key: 'bar', foo: 'bar' })
        .expect('set-cookie', /MW_SESS=.*?;/);
    });

    it('should ctx.session=null remove the session', async () => {
      let result = await request
        .get('/set?key=foo&foo=bar')
        .expect(200)
        .expect({ key: 'foo', foo: 'bar' })
        .expect('set-cookie', /MW_SESS=.*?;/);

      result = await request
        .get('/remove')
        .set({
          cookie: result.headers['set-cookie']
        })
        .expect(204)
        .expect('set-cookie', /MW_SESS=;/);

      await request
        .get('/get')
        .set({
          cookie: result.headers['set-cookie']
        })
        .expect(200)
        .expect({});
    });
  })

  it('should test sameSite=none', async () => {
    const app = await createApp(join(__dirname, 'fixtures/samesite-none-session'));
    const request = createHttpRequest(app);

    await request.get('/set?foo=bar')
      .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36')
      .set('x-forwarded-proto', 'https')
      .expect(200)
      .expect({ foo: 'bar' })
      .expect(res => {
        const cookie = res.headers['set-cookie'].join('|');
        assert(cookie.includes('; samesite=none;'));
      });

    await close(app);
  });
});
