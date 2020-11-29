import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayWebApplication } from '../src/interface';

describe('/test/feature.test.ts', () => {
  describe('test new decorator', () => {
    let app: IMidwayWebApplication;
    beforeAll(async () => {
      app = await creatApp('feature/base-app');
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

    it('test get status 204', async () => {
      const result = await createHttpRequest(app).get('/204');
      expect(result.status).toEqual(204);
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app)
        .get('/')
        .query({ name: 'harry' });
      expect(result.status).toEqual(201);
      expect(result.text).toEqual('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/login');
      expect(result.status).toEqual(302);
    });

    it('test get data with ctx.body', async () => {
      const result = await createHttpRequest(app).get('/ctx-body');
      expect(result.text).toEqual('ctx-body');
    });
  });

  it('should test global use midway middleware id in egg', async () => {
    const app = await creatApp('feature/base-app-middleware');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('1111222233334444egg_middleware');
    await closeApp(app);
  });

  it('should got component config in app', async () => {
    const app = await creatApp('feature/base-app-component-config');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('hello world1');
    await closeApp(app);
  });

  it('should got plugin in app middleware and controller', async () => {
    const app = await creatApp('feature/base-app-plugin-inject');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('hello worldaaaa1aaaa');
    await closeApp(app);
  });

});
