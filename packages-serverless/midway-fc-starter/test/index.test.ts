import { BootstrapStarter } from '../src';
import { join } from 'path';
import * as events from 'events';

function makeRequest(opts) {
  const ee: any = new events.EventEmitter();

  ee.path = '/';
  ee.method = 'POST';
  ee.queries = {};
  ee.headers = {};

  return Object.assign(ee, opts);
}

function start(options) {
  const starter = new BootstrapStarter();
  return starter.start(options);
}

function createContext(handlerName: string) {
  return {
    requestId: '455a3c12-ad49-4e84-a66d-2c3b070c8a41',
    credentials: {},
    function: {
      name: 'functionService',
      handler: `functionService.${handlerName}`,
      memory: 128,
      timeout: 3,
    },
    service: {name: 'serverless-hello-world', qualifier: 'LATEST'},
    region: 'cn-hangzhou',
    accountId: '125087',
    logger: {
      requestId: '455a3c12-ad49-4e84-a66d-2c3b070c8a41',
      logLevel: 'silly',
    },
    retryCount: 0,
    tracing: {openTracingSpanBaggages: {}},
    waitsForEmptyEventLoopBeforeCallback: false,
  };
}

describe('/test/index.test.ts', () => {
  it('should test new starter', async () => {
    const starter = start({
      baseDir: join(__dirname, './fixtures/base-app/src'),
      appDir: join(__dirname, './fixtures/base-app'),
      exportAllHandler: true,
    });

    await starter['initializer'](createContext('event'));

    // test event
    expect(await starter['event']({}, createContext('event'))).toEqual('hello world');

    // api gw
    const apigwResult = await starter['apigw']({
      httpMethod: 'get',
      headers: {
        'Content-Type': 'text/json',
        'X-Ca-Timestamp': Date.now(),
      },
      queryParameters: {},
      method: 'POST',
      query: {
        q: 'testq',
      },
      pathParameters: {
        id: 'id',
      },
      path: '/test',
      body: {
        name: 'test',
      },
      isBase64Encoded: false,
    }, createContext('apigw'));

    expect(apigwResult['headers']).toEqual({
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': 'bbbb=123; path=/; httponly'
    });

    let httpResult;
    let httpStatus;
    let httpHeaders = {}
    let mockRes = {
      send(data) {
        httpResult = data;
      },
      setStatusCode(status) {
        httpStatus = status;
      },
      setHeader(header, value) {
        httpHeaders[header] = value;
      }
    }

    await starter['http'](makeRequest({
      path: '/http',
      method: 'GET',
    }), mockRes, createContext('http'))

    // http
    expect(httpResult).toEqual('Alan|455a3c12-ad49-4e84-a66d-2c3b070c8a41');

    await starter['http_302'](makeRequest({
      path: '/http_302',
      method: 'GET',
    }), mockRes, createContext('http_302'))

    // http
    expect(httpStatus).toEqual(302);
    expect(httpHeaders['location']).toEqual('https://github.com/midwayjs/midway');
  });
  //
  //
  //   it('should wrap in init function', async () => {
  //     const handle = asyncWrapper(async context => {
  //       return context.data;
  //     });
  //     const res: any = await test(handle).run({ data: 1 });
  //     assert.equal(res, 1);
  //   });
  //
  //   it('should wrap with event and context', async () => {
  //     const runtime = start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, event) => {
  //         return event.data;
  //       })(...args);
  //     });
  //     const res: any = await test(handle).run({ data: 1 }, {});
  //     assert.equal(res, 1);
  //   });
  //
  //   it('should wrap with event and throw error', async () => {
  //     const runtime = await start({});
  //
  //     let err;
  //
  //     try {
  //       await runtime.asyncEvent(async (ctx, event) => {
  //         throw new Error('abc');
  //       })();
  //     } catch (error) {
  //       err = error;
  //     }
  //     expect(err.message).toEqual('Internal Server Error');
  //   });
  //
  //   it('should wrap with event and throw real error with env', async () => {
  //     process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
  //     const runtime = await start({});
  //
  //     let err;
  //
  //     try {
  //       await runtime.asyncEvent(async (ctx, event) => {
  //         throw new Error('abc');
  //       })();
  //     } catch (error) {
  //       err = error;
  //     }
  //     expect(err.message).toEqual('abc');
  //     process.env.SERVERLESS_OUTPUT_ERROR_STACK = '';
  //   });
  // });
  //
  // describe('wrapper web event fc', () => {
  //   it('should ok with plain text', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = 'hello world!';
  //       })(...args);
  //     });
  //     const res: any = await test(handle).runHttp('', '');
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
  //     assert.equal(res.body, 'hello world!');
  //   });
  //
  //   it('should ok with json', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = { ok: true };
  //       })(...args);
  //     });
  //     const res = await test(handle).runHttp('', '');
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(
  //       res.headers['content-type'],
  //       'application/json; charset=utf-8'
  //     );
  //     assert.equal(res.body, '{"ok":true}');
  //   });
  //
  //   it('should ok with raw json', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.type = 'application/json';
  //         ctx.body = '{"ok":true}';
  //       })(...args);
  //     });
  //     const res = await test(handle).runHttp('', '');
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(
  //       res.headers['content-type'],
  //       'application/json; charset=utf-8'
  //     );
  //     assert.equal(res.body, '{"ok":true}');
  //   });
  //
  //   it('should ok with raw json/object', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.type = 'application/json';
  //         ctx.body = { ok: true };
  //       })(...args);
  //     });
  //     const res = await test(handle).runHttp('', '');
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(
  //       res.headers['content-type'],
  //       'application/json; charset=utf-8'
  //     );
  //     assert.equal(res.body, '{"ok":true}');
  //   });
  //
  //   it('should ok with Buffer', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = Buffer.from('hello world!');
  //       })(...args);
  //     });
  //     const res = await test(handle).runHttp('', '');
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(res.headers['content-type'], 'application/octet-stream');
  //     assert.equal(res.body, Buffer.from('hello world!').toString('base64'));
  //   });
  //
  //   it('should ok with context', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = ctx.query.requestId;
  //       })(...args);
  //     });
  //     const res = await test(handle).runHttp(
  //       {
  //         queries: {
  //           requestId: 'requestId',
  //         },
  //       },
  //       {}
  //     );
  //     assert.equal(res.statusCode, 200);
  //     assert.equal(res.body, 'requestId');
  //   });
  //
  //   it('should ok with error', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         throw new Error('oops');
  //       })(...args);
  //     });
  //     const result = await test(handle).runHttp('', '');
  //     assert.deepStrictEqual(result, {
  //       isBase64Encoded: false,
  //       statusCode: 500,
  //       headers: {},
  //       body: 'Internal Server Error',
  //     });
  //   });
  //
  //   it('should ok with non-async function', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(ctx => {})(...args);
  //     });
  //     let err;
  //     try {
  //       await test(handle).runHttp('', '');
  //     } catch (ex) {
  //       err = ex;
  //     }
  //     assert.ok(err);
  //     assert.equal(err.message, 'Must be an AsyncFunction');
  //   });
  //
  //   it('should ok with asyncWrap', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, event) => {
  //         return 'hello world!';
  //       })(...args);
  //     });
  //     const res = await test(handle).run({ data: 1 }, {});
  //     assert.equal(res, 'hello world!');
  //   });
  //
  //   it('should ok with asyncWrap when error', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         throw new Error('ooops!');
  //       })(...args);
  //     });
  //     let err;
  //     try {
  //       await test(handle).run('', '');
  //     } catch (ex) {
  //       err = ex;
  //     }
  //
  //     assert.ok(err);
  //     assert.equal(err.message, 'Internal Server Error');
  //   });
  //
  //   it('should ok with asyncWrap when not async functions', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(ctx => {})(...args);
  //     });
  //     let err;
  //     try {
  //       await test(handle).run('', '');
  //     } catch (ex) {
  //       err = ex;
  //     }
  //
  //     assert.ok(err);
  //     assert.equal(err.message, 'Must be an AsyncFunction');
  //   });
  //
  //   it('GET should ok', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = {
  //           path: ctx.path,
  //           method: ctx.method,
  //           query: ctx.query,
  //           headers: ctx.headers,
  //           params: ctx.params,
  //           body: ctx.req.body,
  //         };
  //       })(...args);
  //     });
  //     const q: any = {};
  //     q.echostr = 'hehe';
  //     const event = {
  //       path: '/wechat',
  //       method: 'GET',
  //       headers: {},
  //       queries: q,
  //       body: '',
  //       isBase64Encoded: false,
  //     };
  //     const data = await test(handle).runHttp(JSON.stringify(event), {});
  //     const body = JSON.parse(data.body);
  //     assert.equal(body.path, '/wechat');
  //     assert.equal(body.method, 'GET');
  //     assert.equal(body.query.echostr, 'hehe');
  //   });
  //
  //   it('GET should ok', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         ctx.body = {
  //           path: ctx.path,
  //           method: ctx.method,
  //           query: ctx.query,
  //           headers: ctx.headers,
  //           params: ctx.params,
  //           body: ctx.req.body,
  //         };
  //         // ctx.req.body; // second access
  //         ctx.get('content-type');
  //         ctx.set('content-type', 'application/json');
  //         ctx.status = 200;
  //       })(...args);
  //     });
  //     const q: any = {};
  //     q.echostr = 'hehe';
  //     const event = {
  //       path: '/wechat',
  //       method: 'GET',
  //       headers: { 'content-type': 'text/plain' },
  //       queries: q,
  //       body: Buffer.from('hello world').toString('base64'),
  //       isBase64Encoded: true,
  //     };
  //     const data = await test(handle).runHttp(JSON.stringify(event), {});
  //     const body = JSON.parse(data.body);
  //     assert.equal(body.path, '/wechat');
  //     assert.equal(body.method, 'GET');
  //     assert.equal(body.query.echostr, 'hehe');
  //   });
  //
  //   xit('GET should use faas parameters to appoint parameter', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, user) => {
  //         ctx.body = user + ' hello';
  //       })(...args);
  //     });
  //     const event = {
  //       path: '/',
  //       method: 'GET',
  //       headers: { 'content-type': 'text/plain' },
  //       queries: {
  //         FAAS_ARGS: ['harry'],
  //       },
  //     };
  //     const data = await test(handle).runHttp(JSON.stringify(event), {});
  //     assert(data.body === 'harry hello');
  //   });
  //
  //   xit('GET should get text if return data', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, user) => {
  //         return 'hello world ' + user;
  //       })(...args);
  //     });
  //     const event = {
  //       path: '/',
  //       method: 'GET',
  //       headers: { 'content-type': 'text/plain' },
  //       queries: {
  //         FAAS_ARGS: ['harry'],
  //       },
  //     };
  //     const data = await test(handle).runHttp(JSON.stringify(event), {});
  //     assert(data.body === 'hello world harry');
  //   });
  //
  //   xit('GET should get params in post method', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, user) => {
  //         return 'hello world ' + user;
  //       })(...args);
  //     });
  //     const event = {
  //       path: '/',
  //       method: 'POST',
  //       headers: { 'content-type': 'text/plain' },
  //       queries: {},
  //       body: {
  //         FAAS_ARGS: ['harry'],
  //       },
  //     };
  //     const data = await test(handle).runHttp(JSON.stringify(event), {});
  //     assert(data.body === 'hello world harry');
  //   });
  //
  //   it('should ok with asyncWrap use appoint args in event', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async (ctx, name) => {
  //         return 'hello world!' + name;
  //       })(...args);
  //     });
  //     const res = await test(handle).run(
  //       {
  //         FAAS_ARGS: ['harry'],
  //       },
  //       ''
  //     );
  //     assert.equal(res, 'hello world!harry');
  //   });
  //
  //   it('POST should ok use fc request with body', async () => {
  //     const runtime = await start({});
  //     const handle = asyncWrapper(async (...args) => {
  //       return runtime.asyncEvent(async ctx => {
  //         return ctx.request.body.toString();
  //       })(...args);
  //     });
  //     const req = makeRequest({
  //       method: 'POST',
  //     });
  //     const postData = JSON.stringify({ name: 'fc request' });
  //     send(req, postData);
  //     const data = await test(handle).runHttp(req, {});
  //     assert.equal(data.body, postData);
  //   });
  // });
  //
  // describe('should test with runtime-mock', () =>
  //
  //   it('should get function name and service name from init context', async () => {
  //     const runtime = await start({
  //       initContext:{
  //         function: {
  //           "name": "fc-tmallvtop",
  //           "handler": "tmallvtop.handler",
  //           "initializer": "tmallvtop.initializer",
  //           "initializationTimeout": 3
  //         },
  //         service: {"name": "fc-rank-v-ald-pre", "versionId": "1"}
  //       }
  //     });
  //     expect(runtime.getFunctionName()).toEqual('fc-tmallvtop');
  //     expect(runtime.getFunctionServiceName()).toEqual('fc-rank-v-ald-pre');
  //   });
  //
  //   it('should get function name when empty and set environment', async () => {
  //     mm(process.env, 'MIDWAY_SERVERLESS_FUNCTION_NAME',  'aaa');
  //     mm(process.env, 'MIDWAY_SERVERLESS_SERVICE_NAME',  'bbb');
  //     const runtime = await start();
  //     expect(runtime.getFunctionName()).toEqual('aaa');
  //     expect(runtime.getFunctionServiceName()).toEqual('bbb');
  //     mm.restore();
  //   });
  // })
});
