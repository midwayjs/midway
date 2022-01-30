import { closeCuster, createCluster, createHttpClient } from './utils';

describe('/test/cluster.test.ts', () => {
  describe('test new decorator', () => {
    let master;
    beforeAll(async () => {
      master = await createCluster('cluster/base-app');
    });

    afterAll(async () => {
      await closeCuster(master);
    });

    it('test setHeader decorator', async () => {
      const result = await createHttpClient('http://127.0.0.1:8080/set_header', {
        method: 'get',
        params: { name: 'harry' }
      })
      expect(result.status).toEqual(200);
      expect(result.data).toEqual('bbb');
      expect(result.headers['bbb']).toEqual('aaa');
      expect(result.headers['ccc']).toEqual('ddd');
    });

    it('test get status 204', async () => {
      const result = await createHttpClient('http://127.0.0.1:8080/204');
      expect(result.status).toEqual(204);
    });

    it('test get method with return value', async () => {
      const result = await createHttpClient('http://127.0.0.1:8080/', {
        method: 'get',
        params: { name: 'harry' }
      })
      expect(result.status).toEqual(201);
      expect(result.data).toEqual('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpClient('http://127.0.0.1:8080/login', {
        maxRedirects: 0,
      }).catch(err => {
        return err.response.status;
      });
      expect(result).toEqual(302);
    });

    it('test get data with ctx.body', async () => {
      const result = await createHttpClient('http://127.0.0.1:8080/ctx-body');
      expect(result.data).toEqual('ctx-body');
    });
  });
  //
  // it('should test global use midway middleware id in egg', async () => {
  //   const app = await creatApp('feature/base-app-middleware');
  //   const result = await createHttpRequest(app).get('/');
  //   expect(result.text).toEqual('11112222333344445555egg_middleware');
  //   await closeApp(app);
  // });
  //
  // it('should got component config in app', async () => {
  //   const app = await creatApp('feature/base-app-component-config');
  //   const result = await createHttpRequest(app).get('/');
  //   expect(result.text).toEqual('hello world1');
  //   await closeApp(app);
  // });
  //
  // it('should got plugin in app middleware and controller', async () => {
  //   const app = await creatApp('feature/base-app-plugin-inject');
  //   const result = await createHttpRequest(app).get('/');
  //   expect(result.text).toEqual('hello worldaaaa1aaaa');
  //   await closeApp(app);
  // });
  //
  // it('should test set custom logger in egg by midway logger', async () => {
  //   await remove(join(__dirname, 'fixtures/feature/base-app-set-ctx-logger', 'logs'));
  //   const app = await creatApp('feature/base-app-set-ctx-logger');
  //   const result = await createHttpRequest(app)
  //     .get('/')
  //     .query({ name: 'harry' });
  //   expect(result.status).toEqual(200);
  //   expect(result.text).toEqual('hello world,harry');
  //   await sleep();
  //   expect(matchContentTimes(join(app.getAppDir(), 'logs', 'ali-demo', 'midway-web.log'), 'GET /] aaaaa')).toEqual(3);
  //   expect(matchContentTimes(join(app.getAppDir(), 'logs', 'ali-demo', 'midway-web.log'), 'abcde] custom label')).toEqual(1);
  //   await closeApp(app);
  // });
  //
  // it('should use midway logger ignore replaceEggLogger config', async () => {
  //   const app = await creatApp('feature/base-app-egg-logger');
  //   await closeApp(app);
  // });
  //
  // it('should test not found will got 404', async () => {
  //   const app = await creatApp('feature/base-app-404');
  //   const result = await createHttpRequest(app)
  //     .get('/error');
  //   expect(result.status).toEqual(404);
  //   await closeApp(app);
  // });

});
