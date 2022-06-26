import { createRuntime } from '@midwayjs/runtime-mock';
import * as assert from 'assert';
import * as events from 'events';
import { asyncWrapper, start } from '../src';
import * as mm from 'mm';
// 这里不能用包引，会循环依赖
import {
  HTTPTrigger,
  ApiGatewayTrigger,
} from '../../serverless-fc-trigger/src';
import { join } from 'path';

class Tester {
  handler;

  constructor(handler) {
    this.handler = handler;
  }

  async runHttp(req, res, context = {}) {
    const args = [req, res, context];
    return this.handler.apply(this.handler, args);
  }

  run(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
      return this.handler(...args);
    });
  }
}

function test(handler) {
  return new Tester(handler);
}

function makeRequest(opts) {
  const ee: any = new events.EventEmitter();

  ee.path = '/';
  ee.method = 'POST';
  ee.queries = {};
  ee.headers = {};

  return Object.assign(ee, opts);
}

function send(request: events.EventEmitter, data: string) {
  process.nextTick(() => {
    request.emit('data', Buffer.from(data));
    request.emit('end');
  });
}

describe('/test/index.test.ts', () => {

  afterEach(() => {
    jest.restoreAllMocks()
  });

  describe('wrapper normal event', () => {
    it('should wrap in init function', async () => {
      const handle = asyncWrapper(async context => {
        return context.data;
      });
      const res: any = await test(handle).run({ data: 1 });
      assert.equal(res, 1);
    });

    it('should wrap with event and context', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, event) => {
          return event.data;
        })(...args);
      });
      const res: any = await test(handle).run({ data: 1 }, {});
      assert.equal(res, 1);
    });

    it('should wrap with event and throw error', async () => {
      const runtime = await start({});

      let err;

      try {
        await runtime.asyncEvent(async (ctx, event) => {
          throw new Error('abc');
        })();
      } catch (error) {
        err = error;
      }
      expect(err.message).toEqual('Internal Server Error');
    });

    it('should wrap with event and throw real error with env', async () => {
      process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
      const runtime = await start({});

      let err;

      try {
        await runtime.asyncEvent(async (ctx, event) => {
          throw new Error('abc');
        })();
      } catch (error) {
        err = error;
      }
      expect(err.message).toEqual('abc');
      process.env.SERVERLESS_OUTPUT_ERROR_STACK = '';
    });
  });

  describe('wrapper web event fc', () => {
    it('should ok with plain text', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = 'hello world!';
        })(...args);
      });
      const res: any = await test(handle).runHttp('', '');
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.equal(res.body, 'hello world!');
    });

    it('should ok with json', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = { ok: true };
        })(...args);
      });
      const res = await test(handle).runHttp('', '');
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with raw json', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.type = 'application/json';
          ctx.body = '{"ok":true}';
        })(...args);
      });
      const res = await test(handle).runHttp('', '');
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with raw json/object', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.type = 'application/json';
          ctx.body = { ok: true };
        })(...args);
      });
      const res = await test(handle).runHttp('', '');
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with Buffer', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = Buffer.from('hello world!');
        })(...args);
      });
      const res = await test(handle).runHttp('', '');
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/octet-stream');
      assert.equal(res.body, Buffer.from('hello world!').toString('base64'));
    });

    it('should ok with context', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = ctx.query.requestId;
        })(...args);
      });
      const res = await test(handle).runHttp(
        {
          queries: {
            requestId: 'requestId',
          },
        },
        {}
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.body, 'requestId');
    });

    it('should ok with error', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          throw new Error('oops');
        })(...args);
      });
      const result = await test(handle).runHttp('', '');
      assert.deepStrictEqual(result, {
        isBase64Encoded: false,
        statusCode: 500,
        headers: {},
        body: 'Internal Server Error',
      });
    });

    it('should ok with non-async function', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(ctx => {})(...args);
      });
      let err;
      try {
        await test(handle).runHttp('', '');
      } catch (ex) {
        err = ex;
      }
      assert.ok(err);
      assert.equal(err.message, 'Must be an AsyncFunction');
    });

    it('should ok with asyncWrap', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, event) => {
          return 'hello world!';
        })(...args);
      });
      const res = await test(handle).run({ data: 1 }, {});
      assert.equal(res, 'hello world!');
    });

    it('should ok with asyncWrap when error', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          throw new Error('ooops!');
        })(...args);
      });
      let err;
      try {
        await test(handle).run('', '');
      } catch (ex) {
        err = ex;
      }

      assert.ok(err);
      assert.equal(err.message, 'Internal Server Error');
    });

    it('should ok with asyncWrap when not async functions', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(ctx => {})(...args);
      });
      let err;
      try {
        await test(handle).run('', '');
      } catch (ex) {
        err = ex;
      }

      assert.ok(err);
      assert.equal(err.message, 'Must be an AsyncFunction');
    });

    it('GET should ok', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = {
            path: ctx.path,
            method: ctx.method,
            query: ctx.query,
            headers: ctx.headers,
            params: ctx.params,
            body: ctx.req.body,
          };
        })(...args);
      });
      const q: any = {};
      q.echostr = 'hehe';
      const event = {
        path: '/wechat',
        method: 'GET',
        headers: {},
        queries: q,
        body: '',
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(JSON.stringify(event), {});
      const body = JSON.parse(data.body);
      assert.equal(body.path, '/wechat');
      assert.equal(body.method, 'GET');
      assert.equal(body.query.echostr, 'hehe');
    });

    it('GET should ok', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = {
            path: ctx.path,
            method: ctx.method,
            query: ctx.query,
            headers: ctx.headers,
            params: ctx.params,
            body: ctx.req.body,
          };
          // ctx.req.body; // second access
          ctx.get('content-type');
          ctx.set('content-type', 'application/json');
          ctx.status = 200;
        })(...args);
      });
      const q: any = {};
      q.echostr = 'hehe';
      const event = {
        path: '/wechat',
        method: 'GET',
        headers: { 'content-type': 'text/plain' },
        queries: q,
        body: Buffer.from('hello world').toString('base64'),
        isBase64Encoded: true,
      };
      const data = await test(handle).runHttp(JSON.stringify(event), {});
      const body = JSON.parse(data.body);
      assert.equal(body.path, '/wechat');
      assert.equal(body.method, 'GET');
      assert.equal(body.query.echostr, 'hehe');
    });

    xit('GET should use faas parameters to appoint parameter', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          ctx.body = user + ' hello';
        })(...args);
      });
      const event = {
        path: '/',
        method: 'GET',
        headers: { 'content-type': 'text/plain' },
        queries: {
          FAAS_ARGS: ['harry'],
        },
      };
      const data = await test(handle).runHttp(JSON.stringify(event), {});
      assert(data.body === 'harry hello');
    });

    xit('GET should get text if return data', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          return 'hello world ' + user;
        })(...args);
      });
      const event = {
        path: '/',
        method: 'GET',
        headers: { 'content-type': 'text/plain' },
        queries: {
          FAAS_ARGS: ['harry'],
        },
      };
      const data = await test(handle).runHttp(JSON.stringify(event), {});
      assert(data.body === 'hello world harry');
    });

    xit('GET should get params in post method', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          return 'hello world ' + user;
        })(...args);
      });
      const event = {
        path: '/',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        queries: {},
        body: {
          FAAS_ARGS: ['harry'],
        },
      };
      const data = await test(handle).runHttp(JSON.stringify(event), {});
      assert(data.body === 'hello world harry');
    });

    it('should ok with asyncWrap use appoint args in event', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, name) => {
          return 'hello world!' + name;
        })(...args);
      });
      const res = await test(handle).run(
        {
          FAAS_ARGS: ['harry'],
        },
        ''
      );
      assert.equal(res, 'hello world!harry');
    });

    it('POST should ok use fc request with body', async () => {
      const runtime = await start({});
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          return ctx.request.body.toString();
        })(...args);
      });
      const req = makeRequest({
        method: 'POST',
      });
      const postData = JSON.stringify({ name: 'fc request' });
      send(req, postData);
      const data = await test(handle).runHttp(req, {});
      assert.equal(data.body, postData);
    });
  });

  describe('should test with runtime-mock', () => {
    it('should invoke normal code', async () => {
      const runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/http'),
      });
      await runtime.start();
      const result = await runtime.invoke(
        new HTTPTrigger({
          path: '/help',
          method: 'GET',
        })
      );
      assert.equal(result.body, 'Alan|b1c5100f-819d-c421-3a5e-7782a27d8a33');
      await runtime.close();
    });

    it('should invoke 302', async () => {
      const runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/http-302'),
      });
      await runtime.start();
      const result = await runtime.invoke(
        new HTTPTrigger({
          path: '/help',
          method: 'GET',
        })
      );
      await runtime.close();
      assert.equal(result.statusCode, 302);
      assert.equal(
        result.headers.location,
        'https://github.com/midwayjs/midway'
      );
    });

    it('should invoke normal code', async () => {
      const runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/http-json'),
      });
      await runtime.start();
      const result = await runtime.invoke(
        new HTTPTrigger({
          path: '/help',
          method: 'GET',
        })
      );
      assert.equal(
        result.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(result.body, '{"name":"Alan"}');
      await runtime.close();
    });

    it('should invoke with api gateway', async () => {
      const runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/apigw'),
      });
      await runtime.start();
      const result = await runtime.invoke(
        new ApiGatewayTrigger({
          headers: {
            'Content-Type': 'text/json',
          },
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
        })
      );
      assert(result.isBase64Encoded === false);
      assert(result.statusCode === 200);
      assert(result.headers);
      assert(result.headers['set-cookie'] === 'bbbb=123; path=/; httponly');
      result.headers;
      assert.equal(typeof result.body, 'string');
      const body = JSON.parse(result.body);
      assert.equal(body.method, 'POST');
      assert.equal(body.path, '/test');
      assert.equal(body.body.name, 'test');
      assert.equal(body.params.id, 'id');
      await runtime.close();
    });
  });

  describe('test new property', () => {

    it('should get app', async () => {
      const runtime = await start();
      const app = runtime.getApplication();
      expect(app.use).toBeDefined();
    });

    it('should get function name and service name from init context', async () => {
      const runtime = await start({
        initContext:{
          function: {
            "name": "fc-tmallvtop",
            "handler": "tmallvtop.handler",
            "initializer": "tmallvtop.initializer",
            "initializationTimeout": 3
          },
          service: {"name": "fc-rank-v-ald-pre", "versionId": "1"}
        }
      });
      expect(runtime.getFunctionName()).toEqual('fc-tmallvtop');
      expect(runtime.getFunctionServiceName()).toEqual('fc-rank-v-ald-pre');
    });

    it('should get function name when empty and set environment', async () => {
      mm(process.env, 'MIDWAY_SERVERLESS_FUNCTION_NAME',  'aaa');
      mm(process.env, 'MIDWAY_SERVERLESS_SERVICE_NAME',  'bbb');
      const runtime = await start();
      expect(runtime.getFunctionName()).toEqual('aaa');
      expect(runtime.getFunctionServiceName()).toEqual('bbb');
      mm.restore();
    });
  })
});
