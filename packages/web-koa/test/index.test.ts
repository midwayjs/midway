import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayKoaApplication } from '../src';

describe('/test/feature.test.ts', () => {

  describe('test new features', () => {
    let app: IMidwayKoaApplication;
    beforeAll(async () => {
      app = await creatApp('base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test setHeader decorator', async () => {
      const result = await createHttpRequest(app)
        .get('/set_header')
        .query({ name: 'harry' });
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('bbb');
      expect(result.headers['bbb']).toEqual('aaa');
      expect(result.headers['ccc']).toEqual('ddd');
    });

    it('should test get header with upper case', async () => {
      const result = await createHttpRequest(app).get('/header-upper').set('x-abc', '321');
      expect(result.status).toBe(200);
      expect(result.text).toBe('321');
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app).get('/').query({ name: 'harry', age: 18 });
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry18');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/login');
      expect(result.status).toBe(302);
    });

    it('test get status 204', async () => {
      const result = await createHttpRequest(app).get('/204');
      expect(result.status).toBe(204);
    });

    it('test get data with ctx.body', async () => {
      const result = await createHttpRequest(app).get('/ctx-body');
      expect(result.text).toEqual('ctx-body');
    });

    describe('test 500', function () {
      it('test status 500', async () => {
        const result = await createHttpRequest(app).get('/case/500');
        expect(result.status).toBe(500);
      });

      it('test status 500_1', async () => {
        const result = await createHttpRequest(app).get('/case/500');
        expect(result.status).toBe(500);
      });

    });

    describe('test 204', function () {
      it('test status 204', async () => {
        const result = await createHttpRequest(app).get('/case/204');
        expect(result.status).toBe(204);
      });

      it('test status 204_1', async () => {
        const result = await createHttpRequest(app).get('/case/204_1');
        expect(result.status).toBe(204);
      });

      it('test status 204_2', async () => {
        const result = await createHttpRequest(app).get('/case/204_2');
        expect(result.status).toBe(204);
      });
    });

    describe('test aspect in controller', () => {
      it('should catch error in aspect', async () => {
        const result = await createHttpRequest(app).get('/user/catchThrow');
        expect(result.status).toBe(500);
      });

      it('should catch error in aspect with validate', async () => {
        const result = await createHttpRequest(app).post('/user/catchThrowWithValidate');
        expect(result.status).toBe(500);
      });
    });

    describe('test param decorator', () => {
      it('should test query', async () => {
        const result = await createHttpRequest(app).get('/param/param_query').query('name=harry');
        expect(result.text).toBe('harry');
      });

      it('should test query all', async () => {
        const result = await createHttpRequest(app).get('/param/param_query_all').query({
          name: 'harry',
          other: 1,
        });
        expect(result.body).toStrictEqual({
          name: 'harry',
          other: "1",
        });
      });

      it('should test queries', async () => {
        const result = await createHttpRequest(app).get('/param/param_query').query('name=harry');
        expect(result.text).toBe('harry');
      });

      it('should test queries all', async () => {
        const result = await createHttpRequest(app).get('/param/param_queries_all').query({
          name: 'harry',
          other: 1
        });
        expect(result.body).toStrictEqual({
          name: 'harry',
          other: "1",
        });
      });

      it('should test body', async () => {
        const result = await createHttpRequest(app).post('/param/param_body').send({
          name: 'harry'
        })
        expect(result.text).toBe('harry');
      });

      it('should test body all', async () => {
        const result = await createHttpRequest(app).post('/param/param_body_all').send({
          name: 'harry',
          other: 1
        });
        expect(result.body).toStrictEqual({
          name: 'harry',
          other: 1
        });
      });

      it('should test param', async () => {
        const result = await createHttpRequest(app).get('/param/param/harry');
        expect(result.text).toBe('harry');
      });

      it('should test headers', async () => {
        const result = await createHttpRequest(app).get('/param/headers').set({
          name: 'harry'
        })
        expect(result.text).toBe('harry');
      });

      it('should test session', async () => {
        const sessionResult = await createHttpRequest(app).get('/param/set_session');
        const cookie = sessionResult.headers['set-cookie'];
        const result = await createHttpRequest(app).get('/param/session')
          .set({
            name: 'harry'
          })
          .set('Cookie', cookie)
        expect(result.text).toBe('harry');
      });

      it('should test request path', async () => {
        const result = await createHttpRequest(app).get('/param/request_path');
        expect(result.text).toBe('/param/request_path');
      });

      it('should test request ip', async () => {
        const result = await createHttpRequest(app).get('/param/request_ip');
        expect(result.text).toBe('::ffff:127.0.0.1');
      });

    });
  });

  describe('test function router', function () {
    let app: IMidwayKoaApplication;
    beforeAll(async () => {
      app = await creatApp('base-app-func-router');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test root path', async () => {
      const result = await createHttpRequest(app)
        .get('/')
        .query({ name: 'harry' });
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('bbb');
    });

    it('should not return function router', async () => {
      const result = await createHttpRequest(app)
        .get('/other')
        .query({ name: 'harry' });
      expect(result.status).toEqual(404);
    });
  });

  describe('test wildcard router', function () {
    let app: IMidwayKoaApplication;
    beforeAll(async () => {
      app = await creatApp('base-app-wildcard');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test root path 1', async () => {
      const result = await createHttpRequest(app)
        .get('/');
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('hello world');
    });

    it('test root path 2', async () => {
      const result = await createHttpRequest(app)
        .get('/123');
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('hello world');
    });

    it('test root path 3', async () => {
      const result = await createHttpRequest(app)
        .get('/abc/');
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('hello worldabc');
    });

    it('test root path 4', async () => {
      const result = await createHttpRequest(app)
        .get('/abc/123');
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('hello worldabc');
    });
  });

  it('should test global prefix', async () => {
    const app = await creatApp('base-app-global-prefix');
    let result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ok');

    result = await createHttpRequest(app)
      .get('/api/222');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ok');
    await closeApp(app);
  });
});
