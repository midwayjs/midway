import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  describe('Express passport', () => {
    it('basic local auth', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express'),
        {},
      );

      const request = createHttpRequest(app);

      let result = await request.get('/local-passport')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Found. Redirecting to /login');

      result = await request
        .get('/local-passport')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      await close(app);
    });

    it('should test passport all fail', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express-fail'),
        {},
      );

      const request = createHttpRequest(app);
      let result = await request.get('/')

      expect(result.status).toEqual(401);

      await close(app);
    });

    it('passport with session', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express-session'),
        {},
      );

      const request = createHttpRequest(app);

      let result = await request.get('/local-passport')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Found. Redirecting to /login');

      result = await request
        .get('/local-passport')
        .query({ username: 'admin', password: '123' })

      expect(result.text).toEqual('success');
      expect(result.status).toEqual(200);

      result = await request
        .get('/local-passport')
        .set({
          cookie: result.headers['set-cookie']
        })

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      await close(app);
    });

    it('jwt passport with express', async () => {
      let token;
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express-jwt'),
        {},
      );
      let result = await createHttpRequest(app).get('/gen-jwt');
      token = result.text;
      expect(result.status).toEqual(200);
      expect(typeof result.text).toEqual('string');

      result = await createHttpRequest(app)
        .get('/jwt-passport')
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      await close(app);
    });
  });

  describe('Egg passport', () => {
    it('test passport with egg', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-web'),
        {},
      );

      const request = createHttpRequest(app);

      let result = await request.get('/')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/login\">/login</a>.');

      result = await request
        .get('/')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      result = await request
        .get('/')
        .set({
          cookie: result.headers['set-cookie']
        })

      expect(result.status).toEqual(200);

      await close(app);
    });
  });

  describe('koa passport', () => {
    it('should start koa app and session with passport', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-session'),
        {},
      );

      const request = createHttpRequest(app);

      let result = await request.get('/')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/login\">/login</a>.');

      result = await request
        .get('/')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      result = await request
        .get('/')
        .set({
          cookie: result.headers['set-cookie']
        });

      expect(result.status).toEqual(200);

      await close(app);
    });

    it('should test passport all fail', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-fail'),
        {},
      );

      const request = createHttpRequest(app);
      let result = await request.get('/')

      expect(result.status).toEqual(401);

      await close(app);
    });

    it('jwt passport with koa', async () => {
      let token;
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-jwt'),
        {},
      );
      let result = await createHttpRequest(app).get('/gen-jwt');
      token = result.text;
      expect(result.status).toEqual(200);
      expect(typeof result.text).toEqual('string');

      result = await createHttpRequest(app)
        .get('/jwt-passport')
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      await close(app);
    });

    it('jwt passport with koa and global middleware', async () => {
      let token;
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-jwt-global'),
        {},
      );
      let result = await createHttpRequest(app).get('/gen-jwt');
      token = result.text;
      expect(result.status).toEqual(200);
      expect(typeof result.text).toEqual('string');

      result = await createHttpRequest(app)
        .get('/jwt-passport')
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toEqual(200);
      expect(result.text).toEqual('success');

      await close(app);
    });

    it('should test with open id', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-openid'),
        {},
      );
      let result = await createHttpRequest(app).get('/');
      expect(result.status).toEqual(302);
      expect(result.headers['location']).toMatch('https://g1openid.crcc.cn/oauth/authorize');

      await close(app);
    });
  });
});
