import { closeApp, creatApp, createHttpRequest } from './utils';
import { IMidwayWebApplication } from '../src';

describe('/test/feature.test.ts', () => {
  describe('test new decorator', () => {
    let app: IMidwayWebApplication;
    beforeAll(async () => {
      app = await creatApp('feature/base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app)
        .get('/')
        .query({ name: 'harry' });
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/login');
      expect(result.status).toBe(302);
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
