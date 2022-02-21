import { createHttpServer } from '../util';
import { HttpClient } from '../../src';

describe('/test/util/httpclient.test.ts', function () {

  it('should test base http request', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`);
    expect(Buffer.isBuffer(result.data)).toBeTruthy();
    manager.close();
  });

  it('should test base http request with query', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      data: {
        a: 1,
        b: 2
      },
      dataType: 'json',
    });
    expect(result.data.url).toEqual('/?a=1&b=2');
    manager.close();
  });

  it('should test base http request and return json', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'GET',
      dataType: 'json',
    });
    expect(result.data.message).toEqual('hello world');
    manager.close();
  });

  it('should test base http request and return text', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'GET',
      dataType: 'text',
    });
    expect(result.data).toContain('hello world');
    manager.close();
  });

  it('should test base http request with post and body', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'POST',
      data: {
        a: 1,
        b: 2
      },
      dataType: 'json',
    });
    expect(result.data.message['a']).toEqual(1);
    manager.close();
  });

  it('should test base http request and timeout', async () => {
    const manager = await createHttpServer({
      timeout: 1000,
    });
    const httpclient = new HttpClient();
    let err;

    try {
      await httpclient.request(`http://127.1:${manager.getPort()}/`, {
        method: 'GET',
        dataType: 'text',
        timeout: 500,
      });
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
    manager.close();
  });
});
