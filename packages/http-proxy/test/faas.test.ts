import { createHttpRequest, close, createLegacyFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as nock from 'nock';

describe('test/faas.test.ts', function () {
  let app;
  beforeAll(async () => {
    // nock('https://gw.alicdn.com').get('/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png?version=123').reply(200, '123', {'content-type': 'image/png;charset=utf-8'});
    nock('https://www.baidu.com').get('/').reply(200, '<html>123</html>', {'content-type': 'text/html'});
    nock('https://sm.bdimg.com').get('/static/wiseindex/amd_modules/@searchfe/assert_3ed54c3.js').reply(200, '123', {'content-type': 'application/x-javascript'});
    nock('https://httpbin.org')
      .persist()
      .get('/get?name=midway').reply(200, {
      "args": {
        "name": "midway"
      },
      "headers": {
        "Host": "httpbin.org",
      },
      "url": "https://httpbin.org/get?name=midway"
    }, {'content-type': 'application/json'})
      .post('/post').reply(200, function (uri, requestBody) {
      const body = {
        'headers': {
          'Host': 'httpbin.org',
          'Content-Type': this.req.headers['content-type'],
          'url': 'https://httpbin.org/post'
        },
        'url': 'https://httpbin.org/post'
      } as any;
      if (this.req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        body.form = {
          "name": "midway"
        };
      }
      if (this.req.headers['content-type'] === 'application/json') {
        body.data = JSON.stringify(requestBody);
      }
      return body;
    }, {'content-type': 'application/json'});

    const appDir = join(__dirname, 'fixtures/faas');
    app = await createLegacyFunctionApp(appDir, {});
  })

  afterAll(async () => {
    await close(app);
    nock.restore();
  });

  it('get image by host', async () => {
    const request = await createHttpRequest(app);
    await request.get('/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png?version=123')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('image/png');
        expect(response.body.length).toBeGreaterThan(0);
      });
  });

  it('get javascript by target', async () => {
    const request = await createHttpRequest(app);
    await request.get('/gcdn/mtb/lib-mtop/2.6.1/mtop.js')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/javascript');
        expect(response.text).toMatch(/^!function\(a,b\)\{function c\(\)/);
      });
  });

  it('get to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.get('/httpbin/get?name=midway')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.body.url).toBe('https://httpbin.org/get?name=midway');
        expect(response.body.args.name).toBe('midway');
        expect(response.body.headers['Host']).toBe('httpbin.org');
      });
  });

  it('get html by host', async () => {
    const request = await createHttpRequest(app);
    await request.get('/baidu')
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.text.length).toBeGreaterThan(0);
        expect(response.text).toMatch(/<\/html>$/);
      });
  });

  it('post json to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send({name: 'midway'})
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.body.url).toBe('https://httpbin.org/post');
        expect(response.body.headers['Content-Type']).toBe('application/json');
        expect(response.body.data).toBe(JSON.stringify({ name: 'midway'}));
      });
  });

  it('post x-www-form-urlencoded to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send('name=midway')
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        expect(response.status).toBe(200);
        expect(response.body.url).toBe('https://httpbin.org/post');
        expect(response.body.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
        expect(response.body.form.name).toBe('midway');
      });
  });
});
