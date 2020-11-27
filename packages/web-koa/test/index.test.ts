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
  });

});
