import { Context } from '../src/context';
import * as assert from 'assert';

describe('test http parser', () => {
  it('should parser tencent apigw event', () => {
    const context = new Context(
      require('./resource/scf_apigw.json'),
      require('./resource/scf_ctx.json')
    );
    // alias
    assert(context.req === context.request);
    assert(context.res === context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.req.headers);

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
    assert(context.res.body === 'hello world');
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
      context.res.get('Content-Type'),
      'text/html; charset=utf-8'
    );

    // ctx.params
    assert.deepStrictEqual(context.params['path'], 'value');

    assert.deepStrictEqual(context.is('html', 'application/*'), false);
    assert.deepStrictEqual(context.res.get('ETag'), '');

    const cacheTime = 1587543474000;
    // set etag
    context.set({
      Etag: '1234',
      'Last-Modified': new Date(cacheTime),
    });
    assert.deepStrictEqual(context.res.get('ETag').length, 4);
    assert.deepStrictEqual(context.res.lastModified.getTime(), cacheTime);

    context.lastModified = new Date(cacheTime + 1000);
    assert.deepStrictEqual(
      context.res.lastModified.getTime(),
      cacheTime + 1000
    );

    // ctx.length
    assert.deepStrictEqual(context.length, 7);
    context.length = 100;
    assert.deepStrictEqual(context.length, 100);
    assert.deepStrictEqual(context.res.get('Content-Length'), '100');

    context.cookies.set('bbb', '11111');
    context.cookies.set('ccc', '22');
    assert(context.res.headers['set-cookie'].length === 2);
  });

  it('should parser fc http event', () => {
    const context = new Context(
      Object.assign(require('./resource/fc_http.json'), {
        body: Buffer.from(
          JSON.stringify({
            a: '1',
          })
        ),
      }),
      require('./resource/fc_ctx.json')
    );
    // alias
    assert(context.req === context.request);
    assert(context.res === context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.req.headers);

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

    assert.deepStrictEqual(context.request.body, '{"a":"1"}');

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
    assert(context.res.body === 'hello world');
    assert(context.type === 'text/plain');

    // set json
    context.body = {
      a: 1,
    };
    assert(context.type === 'application/json');
    assert.deepStrictEqual(context.host, '');
  });

  it('should parser aliyun apigw event', () => {
    const context = new Context(
      require('./resource/fc_apigw.json'),
      require('./resource/fc_ctx.json')
    );
    // alias
    assert(context.req === context.request);
    assert(context.res === context.response);
    assert(context.header === context.headers);
    assert(context.headers === context.req.headers);

    // request
    assert(context.method === 'GET');
    assert(context.request.method === 'GET');
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
    assert(context.res.body === 'hello world');
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
});
