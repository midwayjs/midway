import { createHttpServer } from '../util';
import { HttpClient, makeHttpRequest } from '../../src';

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

  it('should test base http request with post and headers', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'POST',
      headers: {},
      data: {},
      dataType: 'json',
      contentType: 'json',
    });
    expect(result.data.headers['content-type']).toEqual('application/json');
    manager.close();
  });

  it('should test base http request with put and body', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'PUT',
      data: {
        a: 1,
        b: 2
      },
      dataType: 'json',
    });
    expect(result.data.message['a']).toEqual(1);
    manager.close();
  });

  it('should test base http request with patch and body', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'PATCH',
      data: {
        a: 1,
        b: 2
      },
      dataType: 'json',
    });
    expect(result.data.message['a']).toEqual(1);
    manager.close();
  });

  it('should test base http request with delete', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient();
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      method: 'DELETE',
    });
    expect(result.statusCode).toEqual(204);
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

  it('should test make http request', async () => {
    const manager = await createHttpServer();
    const result = await makeHttpRequest(`http://127.1:${manager.getPort()}/`);
    expect(Buffer.isBuffer(result.data)).toBeTruthy();
    manager.close();
  });

  it('should test default value ', async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient({
      headers: {
        'x-power-by': 'midway',
      },
    });
    const result = await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      dataType: 'json'
    });
    expect(result.data['headers']['x-power-by']).toEqual('midway');
    manager.close();
  });

  it("should not override default options", async () => {
    const manager = await createHttpServer();
    const httpclient = new HttpClient({
      headers: {
        'x-power-by': 'midway',
      },
    });

    await httpclient.request(`http://127.1:${manager.getPort()}/`, {
      dataType: 'json'
    });

    expect(httpclient.defaultOptions['dataType']).toBeUndefined();
    manager.close();
  });
});
