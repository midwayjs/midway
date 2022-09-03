import { createApp, createHttpRequest, close } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as nock from 'nock';

describe('test/express.test.ts', function () {
  let app;
  beforeAll(async () => {
    nock('https://gw.alicdn.com').get('/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png?version=123').reply(200, '123', {'content-type': 'image/png'});
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

    const appDir = join(__dirname, 'fixtures/express');
    app = await createApp(appDir);
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
        assert(response.status === 200)
        assert(response.headers['content-type'] === 'image/png')
        assert(response.body.length);
      });
  });

  it('get html by host', async () => {
    const request = await createHttpRequest(app);
    await request.get('/baidu')
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.text.length);
        assert(response.text.endsWith('</html>'));
      });
  });

  it('get javascript by target', async () => {
    const request = await createHttpRequest(app);
    await request.get('/bdimg/static/wiseindex/amd_modules/@searchfe/assert_3ed54c3.js')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.headers['content-type'] === 'application/x-javascript')
      });
  });

  it('get to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.get('/httpbin/get?name=midway')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/get?name=midway');
        assert(response.body.args.name === 'midway');
        assert(response.body.headers['Host'] === 'httpbin.org');
      });
  });

  it('post json to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send({name: 'midway'})
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/post');
        assert(response.body.headers['Content-Type'] === 'application/json');
        assert(response.body.data === JSON.stringify({ name: 'midway'}));
      });
  });

  it('post x-www-form-urlencoded to httpbin', async () => {
    const request = await createHttpRequest(app);
    await request.post('/httpbin/post')
      .send('name=midway')
      .set('Accept', 'application/json')
      .expect(200)
      .then(async response => {
        assert(response.status === 200)
        assert(response.body.url === 'https://httpbin.org/post');
        assert(response.body.headers['Content-Type'] === 'application/x-www-form-urlencoded');
        assert(response.body.form.name === 'midway');
      });
  });
});
