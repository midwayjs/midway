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
        configurationModule: require('../src')
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
      ]);

      await fn({type: 'req'} as any, {} as any, () => {
      });
      expect(i).toEqual(9);
    });

    it('should catch error in middleware', async () => {
      const app = await createLightApp('', {
        configurationModule: require('../src')
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
      ]);

      try {
        await fn({type: 'req'} as any, {} as any, (err) => {
        });
      } catch (error) {
        console.log(error);
      }

      expect(i).toEqual(5);
    });
  });

});
