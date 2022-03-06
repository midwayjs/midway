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
});
