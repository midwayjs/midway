import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayExpressApplication, MidwayExpressMiddlewareService} from '../src';
import { createLightApp } from '@midwayjs/mock';

describe('/test/feature.test.ts', () => {

  describe('test new features', () => {
    let app: IMidwayExpressApplication;
    beforeAll(async () => {
      app = await creatApp('base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test setHeader decorator', async () => {
      const result = await createHttpRequest(app)
        .get('/api/set_header')
        .query({ name: 'harry' });
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('bbb');
      expect(result.headers['bbb']).toEqual('aaa');
      expect(result.headers['ccc']).toEqual('ddd');
    });

    it('should test get header with upper case', async () => {
      const result = await createHttpRequest(app).get('/api/header-upper').set('x-abc', '321');
      expect(result.status).toBe(200);
      expect(result.text).toBe('321');
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app).get('/api/').query({ name: 'harry' });
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry');
    });

    it('test post json data', async () => {
      const result = await createHttpRequest(app).post('/api/').send({
        bbbbb: 222,
      })
      expect(result.status).toBe(200);
      expect(result.text).toBe('222');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/api/login');
      expect(result.status).toBe(302);
    });

    it('test get status 204', async () => {
      const result = await createHttpRequest(app).get('/api/204');
      console.log('result.status', result.status);
      expect(result.status).toBe(204);
    });

    it('test get data with ctx.body', async () => {
      const result = await createHttpRequest(app).get('/api/ctx-body');
      expect(result.text).toEqual('ctx-body');
    });
  });

  describe('test wildcard router', function () {
    let app: IMidwayExpressApplication;
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

  describe('test middleware', function () {

    it('should test middleware', async () => {
      const app = await createLightApp('', {
        configurationModule: require('../src'),
        globalConfig: {
          keys: '12345'
        }
      });
      app.getApplicationContext().bind(MidwayExpressMiddlewareService);

      const middlewareService = await app.getApplicationContext().getAsync(MidwayExpressMiddlewareService, [app.getApplicationContext()]);
      let i = 0;
      const fn = await middlewareService.compose([
        (req, res, next) => {
          i += 2;
          next();
        },
        (req, res, next) => {
          i += 3;
          next();
        },
        (req, res, next) => {
          i += 4;
          next();
        },
      ], app as any);

      await fn({type: 'req'} as any, {} as any, () => {
      });
      expect(i).toEqual(9);
    });

    it('should catch error in middleware', async () => {
      const app = await createLightApp('', {
        configurationModule: require('../src'),
        globalConfig: {
          keys: ['12345']
        }
      });

      const middlewareService = await app.getApplicationContext().getAsync(MidwayExpressMiddlewareService, [app.getApplicationContext()]);
      let i = 0;
      const fn = await middlewareService.compose([
        (req, res, next) => {
          i += 2;
          next();
        },
        (req, res, next) => {
          i += 3;
          throw new Error('custom error');
        },
      ], app as any);

      try {
        await fn({type: 'req'} as any, {} as any, (err) => {
        });
      } catch (error) {
        console.log(error);
      }

      expect(i).toEqual(5);
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

  describe('test router middleware', () => {
    it('should test middleware in different router', async () => {
      const app = await creatApp('base-app-middleware');
      const result = await createHttpRequest(app)
        .get('/');
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('undefinedhello world');

      const result1 = await createHttpRequest(app)
        .get('/11');
      expect(result1.status).toEqual(200);
      expect(result1.text).toEqual('harryhello world11');
      await closeApp(app);
    });
  });

  it('should test global filter', async () => {
    const app = await creatApp('base-app-error-filter');
    const result = await createHttpRequest(app)
      .get('/11');
    expect(result.status).toEqual(404);

    const result1 = await createHttpRequest(app)
      .get('/');
    expect(result1.status).toEqual(200);
    expect(result1.body).toEqual({
      message: 'my error',
      status: 500
    });
    await closeApp(app);
  });

  it('should test global match', async () => {
    const app = await creatApp('base-app-global-match');
    const result = await createHttpRequest(app)
      .get('/11');
    expect(result.status).toEqual(404);

    const result1 = await createHttpRequest(app)
      .get('/');
    expect(result1.status).toEqual(200);
    expect(result1.body).toEqual({
      'data': {
        'value': {
          'user': 'harry'
        }
      },
      'status': 200
    });
    await closeApp(app);
  });

});
