import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayKoaApplication } from '../src';
import { makeHttpRequest } from '@midwayjs/core';

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

    it('test post json data', async () => {
      const result = await createHttpRequest(app).post('/').send({
        bbbb: 222,
      });
      expect(result.status).toBe(200);
      expect(result.text).toBe('222');
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
          other: '1',
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
          other: '1',
        });
      });

      it('should test body', async () => {
        const result = await createHttpRequest(app).post('/param/param_body').send({
          name: 'harry'
        });
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
        });
        expect(result.text).toBe('harry');
      });

      it('should test session', async () => {
        const sessionResult = await createHttpRequest(app).get('/param/set_session');
        const cookie = sessionResult.headers['set-cookie'];
        const result = await createHttpRequest(app).get('/param/session')
          .set({
            name: 'harry'
          })
          .set('Cookie', cookie);
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

  it('should test router middleware with class', async () => {
    const app = await creatApp('base-app-router-middleware');
    let result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('123');
  });

  it('should test default onerror set status', async () => {
    const app = await creatApp('base-app-default-onerror');
    const result1 = await createHttpRequest(app)
      .get('/');
    expect(result1.status).toEqual(400);

    const result = await createHttpRequest(app)
      .get('/')
      .set('Accept', 'application/json');
    expect(result.body.code).toEqual('400');
    expect(result.body.message).toEqual('my error');
    await closeApp(app);
  });

  it('should test global filter', async () => {
    const app = await creatApp('base-app-error-filter');
    const result = await createHttpRequest(app)
      .get('/11');
    expect(result.status).toEqual(200);
    expect(result.body).toEqual({
      'message': '/11 Not Found',
      'status': 404
    });

    const result1 = await createHttpRequest(app)
      .get('/');
    expect(result1.status).toEqual(200);
    expect(result1.body).toEqual({
      message: 'my error',
      status: 500
    });
    await closeApp(app);
  });

  it('should test not found will got 404', async () => {
    const app = await creatApp('base-app-404');
    const result = await createHttpRequest(app)
      .get('/error');
    expect(result.status).toEqual(404);
    await closeApp(app);
  });

  it('should test set favicon undefined', async () => {
    const app = await creatApp('base-app-favicon-undefined');
    const result = await createHttpRequest(app)
      .get('/favicon.ico');
    expect(result.status).toEqual(200);
    await closeApp(app);
  });

  it('should test set favicon string', async () => {
    const app = await creatApp('base-app-favicon-string');
    const result = await createHttpRequest(app)
      .get('/favicon.ico');
    expect(result.status).toEqual(302);
    await closeApp(app);
  });

  it('should test set favicon buffer', async () => {
    const app = await creatApp('base-app-favicon-buffer');
    const result = await createHttpRequest(app)
      .get('/favicon.ico');
    expect(result.status).toEqual(200);
    await closeApp(app);
  });

  it('should test just exists middleware router and not throw error', async () => {
    const app = await creatApp('base-app-middleware-router');
    const result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('abc');
    await closeApp(app);
  });

  it('should test throw error got right type when set json type', async () => {
    const app = await creatApp('base-app-json-error');
    let result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(400);
    expect(result.body).toEqual({
      'code': '400',
      'message': 'my error'
    });

    result = await createHttpRequest(app)
      .get('/bbb.json');
    expect(result.status).toEqual(400);
    expect(result.body).toEqual({
      'code': '400',
      'message': 'my error'
    });

    result = await createHttpRequest(app)
      .get('/accept_json')
      .set('Accept', 'text/*, application/json');
    expect(result.status).toEqual(400);
    expect(result.body).toEqual({
      'code': '400',
      'message': 'my error'
    });

    await closeApp(app);
  });

  it('should test middleware return value and body not empty', async () => {
    const app = await creatApp('base-app-middleware-return-body');
    const result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('{"code":0,"msg":"ok","data":null}');

    const result1 = await createHttpRequest(app)
      .get('/undefined');
    expect(result1.status).toEqual(200);
    expect(result1.text).toEqual('{"code":0,"msg":"ok"}');

    const result2 = await createHttpRequest(app)
      .get('/null');
    expect(result2.status).toEqual(200);
    expect(result2.text).toEqual('{"code":0,"msg":"ok","data":null}');
    await closeApp(app);
  });

  it('should test add dynamic router', async () => {
    const app = await creatApp('base-app-dynamic-router');
    const result = await createHttpRequest(app)
      .get('/api/user');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world123');
    await closeApp(app);
  });

  it('should test query parser', async () => {
    const app = await creatApp('base-app-query-parser');
    let result = await createHttpRequest(app)
      .get('/query_array')
      .query({
        appId: '31062',
        flowId: '1330',
        mixFlowInstIds: ['108015365', '108015366'],
        flowInstIds: ['103137222', '103137223']
      });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":"31062","flowId":"1330","mixFlowInstIds":["108015365","108015366"],"flowInstIds":["103137222","103137223"]}));

    result = await createHttpRequest(app)
      .get('/query_array_duplicate?appId=123&appId=456');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":["123","456"]}));
    await closeApp(app);
  });

  it('should test locals proxy state', async () => {
    const app = await creatApp('base-app-state-locals');
    let result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('{"locals":{"b":2,"a":1},"state":{"b":2,"a":1}}');

    await closeApp(app);
  });

  it('should test set server timeout', async () => {
    const app = await creatApp('base-app-server-timeout') as any;
    const server = app.getFramework().getServer();
    await server.listen(0);

    let err;
    try {
      await makeHttpRequest('http://localhost:' + server.address().port + '/timeout', {
        method: 'GET',
        dataType: 'text',
      });
    } catch (e) {
      err = e;
    }

    expect(err.message).toMatch(/socket hang up/);
    await server.close();
    await closeApp(app);
  });
});
