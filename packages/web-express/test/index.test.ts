import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayExpressApplication } from '../src';

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

});
