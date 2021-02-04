import { closeApp, creatApp, createHttpRequest, matchContentTimes, sleep } from './utils';
import { IMidwayWebApplication } from '../src/interface';
import { join } from 'path';

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
    expect(result.text).toEqual('11112222333344445555egg_middleware');
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

  it('should test set custom logger in egg by midway logger', async () => {
    const app = await creatApp('feature/base-app-set-ctx-logger');
    const result = await createHttpRequest(app)
      .get('/')
      .query({ name: 'harry' });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,harry');
    await sleep();
    expect(matchContentTimes(join(app.getAppDir(), 'logs', 'ali-demo', 'midway-web.log'), 'custom label')).toEqual(1);
    await closeApp(app);
  });

});
