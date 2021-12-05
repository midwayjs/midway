import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework as ExpressFramework } from '@midwayjs/express';
import { Framework as KoaFramework } from '@midwayjs/koa';
import { Framework as EggFramework } from '@midwayjs/web';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  describe('Express passport', () => {
    it('basic local auth', async () => {
      process.env['MIDWAY_PASSPORT_MODE'] = 'express'
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express'),
        {},
        ExpressFramework
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

      process.env['MIDWAY_PASSPORT_MODE'] = undefined;
      await close(app);
    });

    it('passport with session', async () => {
      process.env['MIDWAY_PASSPORT_MODE'] = 'express'
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express-session'),
        {},
        ExpressFramework
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

      process.env['MIDWAY_PASSPORT_MODE'] = undefined;
      await close(app);
    });

    it('jwt passport with express', async () => {
      process.env['MIDWAY_PASSPORT_MODE'] = 'express'
      let token;
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-express-jwt'),
        {},
        ExpressFramework
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
      process.env['MIDWAY_PASSPORT_MODE'] = undefined;
    });
  });

  describe('Egg passport', () => {
    it('test passport with egg', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-web'),
        {},
        EggFramework
      );

      const request = createHttpRequest(app);

      let result = await request.get('/')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/login\">/login</a>.');

      result = await request
        .get('/')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/\">/</a>.');

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

    it('should start koa app with pure passport', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa'),
        {},
        KoaFramework
      );

      const request = createHttpRequest(app);

      let result = await request.get('/')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/login\">/login</a>.');

      result = await request
        .get('/')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/\">/</a>.');

      result = await request
        .get('/')
        .set({
          cookie: result.headers['set-cookie']
        })

      expect(result.status).toEqual(200);

      await close(app);
    });

    it('should start koa app and session with passport', async () => {
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-session'),
        {},
        KoaFramework
      );

      const request = createHttpRequest(app);

      let result = await request.get('/')

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/login\">/login</a>.');

      result = await request
        .get('/')
        .query({ username: 'admin', password: '123' })

      expect(result.status).toEqual(302);
      expect(result.text).toEqual('Redirecting to <a href=\"/\">/</a>.');

      result = await request
        .get('/')
        .set({
          cookie: result.headers['set-cookie']
        })

      expect(result.status).toEqual(200);

      await close(app);
    });

    it('jwt passport with koa', async () => {
      let token;
      const app = await createApp(
        join(__dirname, 'fixtures', 'passport-koa-jwt'),
        {},
        KoaFramework
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
});
