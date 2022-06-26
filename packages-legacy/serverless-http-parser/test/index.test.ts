import * as assert from 'assert';
import { Application, HTTPRequest, HTTPResponse } from '../src';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import * as mm from 'mm';

describe('test http parser', () => {
  it('should parser tencent apigw event', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const context = app.createContext(req, res);
    assert(context.toJSON().request);

    // alias
    assert(context.req !== context.request);
    assert(context.res !== context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.request.headers);

    // request
    assert(context.method === 'POST');
    assert(context.request.method === 'POST');
    assert(context.path === '/test/value');
    assert(context.request.path === '/test/value');
    assert(context.url === '/test/value?foo=bar&bob=alice');
    assert(context.request.url === '/test/value?foo=bar&bob=alice');
    assert(context.ip === '10.0.2.14');
    assert(context.request.ip === '10.0.2.14');
    assert.deepStrictEqual(context.query, {
      bob: 'alice',
      foo: 'bar',
    });
    assert.deepStrictEqual(context.request.query, {
      bob: 'alice',
      foo: 'bar',
    });

    assert.deepStrictEqual(
      context.request.body,
      JSON.stringify({
        test: 'body',
      })
    );

    // get request header
    assert.deepStrictEqual(context.get('User-Agent'), 'User Agent String');

    // set response header
    context.set('X-FaaS-Duration', 2100);
    assert.deepStrictEqual(context.response.get('X-FaaS-Duration'), '2100');

    // set response status
    assert(context.status === 200);
    context.status = 400;
    assert(context.status === 400);

    // set string
    context.body = 'hello world';
    assert(context.body === 'hello world');
    assert(context.response.body === 'hello world');
    assert(context.type === 'text/plain');

    // set json
    context.body = {
      a: 1,
    };
    assert(context.type === 'application/json');

    assert.deepStrictEqual(context.accepts(), [
      'text/html',
      'application/xml',
      'application/json',
    ]);
    assert.deepStrictEqual(context.acceptsEncodings(), ['identity']);
    assert.deepStrictEqual(context.acceptsCharsets(), ['*']);
    assert.deepStrictEqual(context.acceptsLanguages(), ['en-US', 'en', 'cn']);
    assert.deepStrictEqual(
      context.host,
      'service-3ei3tii4-251000691.ap-guangzhou.apigateway.myqloud.com'
    );
    assert.deepStrictEqual(
      context.hostname,
      'service-3ei3tii4-251000691.ap-guangzhou.apigateway.myqloud.com'
    );

    context.type = 'html';
    assert.deepStrictEqual(
      context.response.get('Content-Type'),
      'text/html; charset=utf-8'
    );

    // ctx.params
    assert.deepStrictEqual(context.params['path'], 'value');

    assert.deepStrictEqual(context.is('html', 'application/*'), false);
    assert.deepStrictEqual(context.response.get('ETag'), '');

    const cacheTime = 1587543474000;
    // set etag
    context.set({
      Etag: '1234',
      'Last-Modified': new Date(cacheTime),
    });
    assert.deepStrictEqual(context.response.get('ETag').length, 4);
    assert.deepStrictEqual(context.response.lastModified.getTime(), cacheTime);

    context.lastModified = new Date(cacheTime + 1000);
    assert.deepStrictEqual(
      context.response.lastModified.getTime(),
      cacheTime + 1000
    );

    // ctx.length
    assert.deepStrictEqual(context.length, 7);
    context.length = 100;
    assert.deepStrictEqual(context.length, 100);
    assert.deepStrictEqual(context.response.get('Content-Length'), '100');

    // context.cookies.set('bbb', '11111');
    // context.cookies.set('ccc', '22');
    // assert(context.res.headers['set-cookie'].length === 2);
  });

  it('body should undefined when method not post', () => {
    const app = new Application();
    const req = require('./resource/fc_http.json');
    req.headers['Content-Type'] = 'application/json';
    const res = new HTTPResponse();
    const context = app.createContext(req, res);
    assert(!context.request.body);
  });

  it('should parser fc http event', () => {
    const app = new Application();
    const req = Object.assign(require('./resource/fc_http.json'), {
      body: Buffer.from(
        JSON.stringify({
          a: '1',
        })
      ),
    });
    const res = new HTTPResponse();
    const context = app.createContext(req, res);

    // alias
    assert(context.req !== context.request);
    assert(context.res !== context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.request.headers);

    // request
    assert(context.method === 'GET');
    assert(context.request.method === 'GET');
    assert(context.path === '/daily/');
    assert(context.request.path === '/daily/');
    assert(context.url === '/daily/?a=1');
    assert(context.request.url === '/daily/?a=1');
    assert(context.ip === '127.0.0.1');
    assert(context.request.ip === '127.0.0.1');
    assert.deepStrictEqual(context.query, {
      a: '1',
    });
    assert.deepStrictEqual(context.request.query, {
      a: '1',
    });

    assert.deepStrictEqual(context.request.body, undefined);

    assert(context.cookies.get('_ga', {
      signed: false
    }) === 'GA1.2.690852134.1546410522');

    // get request header
    assert.deepStrictEqual(
      context.get('User-Agent'),
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
    );

    // set response header
    context.set('X-FaaS-Duration', 2100);
    assert.deepStrictEqual(context.response.get('X-FaaS-Duration'), '2100');

    // set response status
    assert(context.status === 200);
    context.status = 400;
    assert(context.status === 400);

    // set string
    context.body = 'hello world';
    assert(context.body === 'hello world');
    assert(context.response.body === 'hello world');
    assert(context.type === 'text/plain');

    // set json
    context.body = {
      a: 1,
    };
    assert(context.type === 'application/json');
    assert.deepStrictEqual(context.host, '');
  });

  it('should parser aliyun apigw event', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/fc_apigw.json'),
      require('./resource/fc_ctx.json')
    );
    const res = new HTTPResponse();
    const context = app.createContext(req, res);

    // alias
    assert(context.req !== context.request);
    assert(context.res !== context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.req.headers);

    // request
    assert(context.method === 'POST');
    assert(context.request.method === 'POST');
    assert(context.path === '/api');
    assert(context.request.path === '/api');
    assert(context.url === '/api?name=test');
    assert(context.request.url === '/api?name=test');
    assert(context.ip === '');
    assert(context.request.ip === '');
    assert.deepStrictEqual(context.query, {
      name: 'test',
    });
    assert.deepStrictEqual(context.request.query, {
      name: 'test',
    });

    assert.deepStrictEqual(
      context.request.body,
      JSON.stringify({
        test: 'body',
      })
    );

    // get request header
    assert(context.get('User-Agent'), 'User Agent String');

    // set response header
    context.set('X-FaaS-Duration', 2100);
    assert(context.response.get('X-FaaS-Duration'), '2100');

    // set response status
    assert(context.status === 200);
    context.status = 400;
    assert(context.status === 400);

    // set string
    context.body = 'hello world';
    assert(context.body === 'hello world');
    assert(context.response.body === 'hello world');
    assert(context.type === 'text/plain');

    // set json
    context.body = {
      a: 1,
    };
    assert(context.type === 'application/json');

    assert.deepStrictEqual(
      context.host,
      'service-3ei3tii4-251000691.ap-guangzhou.apigateway.myqloud.com'
    );
  });

  describe('test aliyun apigw post type', () => {
    it('should parse text/html and got string body', () => {
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/fc_apigw_post_text.json'),
        require('./resource/fc_ctx.json')
      );
      const res = new HTTPResponse();
      const context = app.createContext(req, res);

      // alias
      assert(context.req !== context.request);
      assert(context.res !== context.response);
      assert(context.header === context.headers);
      assert(context.headers === context.req.headers);

      // request
      assert(context.method === 'POST');
      assert(context.request.method === 'POST');
      assert(context.path === '/api/321');
      assert(context.request.path === '/api/321');

      // test parser body, it's string because content-type is text/html
      assert(context.request.body === '{"c":"b"}');
    });

    it('should parse application/json and got json body', () => {
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/fc_apigw_post_json.json'),
        require('./resource/fc_ctx.json')
      );
      const res = new HTTPResponse();
      const context = app.createContext(req, res);

      // alias
      assert(context.req !== context.request);
      assert(context.res !== context.response);
      assert(context.header === context.headers);
      assert(context.headers === context.req.headers);

      // request
      assert(context.method === 'POST');
      assert(context.request.method === 'POST');
      assert(context.path === '/api/321');
      assert(context.request.path === '/api/321');

      // test parser body, it's string because content-type is text/html
      assert.deepStrictEqual(context.request.body, { c: 'b' });
    });

    it('should parse application/json and got json body(https)', () => {
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/fc_apigw_post_json_https.json'),
        require('./resource/fc_ctx.json')
      );
      const res = new HTTPResponse();
      const context = app.createContext(req, res);

      // alias
      assert(context.req !== context.request);
      assert(context.res !== context.response);
      assert(context.header === context.headers);
      assert(context.headers === context.req.headers);

      // request
      assert(context.method === 'POST');
      assert(context.request.method === 'POST');
      assert(context.path === '/api/321');
      assert(context.request.path === '/api/321');

      // test parser body, it's string because content-type is text/html
      assert.deepStrictEqual(context.request.body, { c: 'b' });
      assert(context.request.secure);
    });

    it('should parse form-urlencoded and got json body', () => {
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/fc_apigw_post_form.json'),
        require('./resource/fc_ctx.json')
      );
      const res = new HTTPResponse();
      const context = app.createContext(req, res);

      // alias
      assert(context.req !== context.request);
      assert(context.res !== context.response);
      assert(context.header === context.headers);
      assert(context.headers === context.req.headers);

      // request
      assert(context.method === 'POST');
      assert(context.request.method === 'POST');
      assert(context.path === '/api/321');
      assert(context.request.path === '/api/321');

      // test parser body, it's string because content-type is text/html
      assert.deepStrictEqual(context.request.body, { c: 'b' });
    });

    it('should parse json by gw filter', () => {
      // 网关过滤后的结果
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/fc_apigw_post_gw_filter.json'),
        require('./resource/fc_ctx.json')
      );
      const res = new HTTPResponse();
      const context = app.createContext(req, res);

      // alias
      assert(context.req !== context.request);
      assert(context.res !== context.response);
      assert(context.header === context.headers);
      assert(context.headers === context.req.headers);

      // request
      assert(context.method === 'POST');
      assert(context.request.method === 'POST');
      assert(context.path === '/api/321');
      assert(context.request.path === '/api/321');

      // test parser body, it's string because content-type is text/html
      assert.deepStrictEqual(context.request.body, '{"c":"b"}');
    });
  });

  it('should test callback', async () => {
    const app = new Application();
    // app.use(async (ctx, next) => {
    //   ctx.aaa = 'test';
    //   await next();
    // });
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const respond = app.callback();
    const ctx: FaaSHTTPContext = await new Promise(resolve => {
      respond(req, res, ctx => {
        resolve(ctx);
      });
    });
    // assert((ctx as any).aaa === 'test');
    assert.deepStrictEqual(
      ctx.originContext,
      require('./resource/scf_ctx.json')
    );
    assert.deepStrictEqual(
      ctx.originEvent,
      require('./resource/scf_apigw.json')
    );
    const n = Date.now();
    ctx.etag = n + '';
    assert(ctx.etag === '"' + n + '"');
    assert((ctx as any).logger === console);

    assert(ctx.request.accepts('html') === 'html');
    assert(ctx.accept);

    ctx.append('X-FaaS-Time', '444');
    assert(ctx.response.headers['x-faas-time']);
    ctx.remove('X-FaaS-Time');
    assert(!ctx.response.headers['x-faas-time']);

    ctx.type = 'html';
    assert(ctx.response.headers['content-type']);
    ctx.body = null;
    assert(!ctx.response.headers['content-type']);

    ctx.body = '22';
    assert(ctx.status === 204);
  });

  it('should set status first time', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const ctx = app.createContext(req, res);
    ctx.body = '123';
    assert(ctx.status === 200);
  });

  it('should set body use buffer', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const ctx = app.createContext(req, res);
    ctx.body = Buffer.from('123');
    assert(ctx.status === 200);
  });

  it('should set body use stream', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const ctx = app.createContext(req, res);
    try {
      ctx.body = { pipe: () => {} };
    } catch (err) {
      assert(err.message === 'unsupport pipe value');
    }
  });

  it('set req url', () => {
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    req.url = '/api/123?name=test';
    assert(req.path === '/api/123');
    assert((req.query as any).name === 'test');
  });

  it('should test redirect', () => {
    const app = new Application();
    const req = new HTTPRequest(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    const res = new HTTPResponse();
    const ctx: FaaSHTTPContext = app.createContext(req, res);
    ctx.redirect('http://google.com');
    assert.equal(ctx.response.header.location, 'http://google.com');
    assert.equal(ctx.status, 302);

    // should auto fix not encode url
    ctx.redirect('http://google.com/😓');
    assert.equal(ctx.status, 302);
    assert.equal(
      ctx.response.headers.location,
      'http://google.com/%F0%9F%98%93'
    );

    // should redirect to Referer
    ctx.request.headers.referrer = '/login';
    ctx.redirect('back');
    assert.equal(ctx.response.header.location, '/login');

    // should default to alt
    delete ctx.request.header['referrer'];
    ctx.remove('referer');
    ctx.remove('location');
    ctx.redirect('back', '/index.html');
    assert.equal(ctx.response.header.location, '/index.html');

    // should default redirect to /
    ctx.remove('location');
    ctx.redirect('back');
    assert.equal(ctx.response.header.location, '/');

    // should respond with html
    const url = 'http://google.com';
    ctx.header.accept = 'text/html';
    ctx.redirect(url);
    assert.equal(
      ctx.response.header['content-type'],
      'text/html; charset=utf-8'
    );
    assert.equal(ctx.body, `Redirecting to <a href="${url}">${url}</a>.`);

    // should escape the url
    let url1 = '<script>';
    ctx.header.accept = 'text/html';
    ctx.redirect(url1);
    url1 = escape(url1);
    assert.equal(
      ctx.response.header['content-type'],
      'text/html; charset=utf-8'
    );
    assert.equal(ctx.body, `Redirecting to <a href="${url1}">${url1}</a>.`);

    // should respond with text
    const url2 = 'http://google.com';
    ctx.header.accept = 'text/plain';
    ctx.redirect(url);
    assert.equal(ctx.body, `Redirecting to ${url2}.`);

    // should not change the status code
    const url3 = 'http://google.com';
    ctx.status = 301;
    ctx.header.accept = 'text/plain';
    ctx.redirect('http://google.com');
    assert.equal(ctx.status, 301);
    assert.equal(ctx.body, `Redirecting to ${url3}.`);

    // should change the status code
    const url4 = 'http://google.com';
    ctx.status = 304;
    ctx.header.accept = 'text/plain';
    ctx.redirect('http://google.com');
    assert.equal(ctx.status, 302);
    assert.equal(ctx.body, `Redirecting to ${url4}.`);

    // should overwrite content-type
    ctx.body = {};
    const url5 = 'http://google.com';
    ctx.header.accept = 'text/plain';
    ctx.redirect('http://google.com');
    assert.equal(ctx.status, 302);
    assert.equal(ctx.body, `Redirecting to ${url5}.`);
    assert.equal(ctx.type, 'text/plain');
  });

  describe('test onerror', () => {
    it('test throw error', () => {
      const app = new Application();
      assert.throws(
        () => {
          app.onerror('foo');
        },
        TypeError,
        'non-error thrown: foo'
      );
    });
    it('test emit error', () => {
      const app = new Application();
      const err = new Error('mock stack null');
      err.stack = null;
      app.onerror(err);
      let msg = '';
      mm(console, 'error', input => {
        if (input) msg = input;
      });
      app.onerror(err);
      assert(msg === '  Error: mock stack null');
    });
    it('should test ctx.throw', function () {
      const app = new Application();
      const req = new HTTPRequest(
        require('./resource/scf_apigw.json'),
        require('./resource/scf_ctx.json')
      );
      const res = new HTTPResponse();
      const ctx: FaaSHTTPContext = app.createContext(req, res);
      try {
        ctx.throw(403, 'throw error');
      } catch (er) {
        // got err
      }
      assert('run here');
    });
  });
});

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
