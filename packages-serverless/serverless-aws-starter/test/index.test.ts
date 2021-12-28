import * as assert from 'assert';
import { asyncWrapper, start } from '../src';
import { AWSBasicHTTPEvent } from '../src/interface';
import * as mm from 'mm';

class Tester {
  handler;

  constructor(handler) {
    this.handler = handler;
  }

  async runHttp(event: AWSBasicHTTPEvent, context = {}) {
    const args = [
      Object.assign({}, require('../resource/event'), event),
      context,
    ];
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

describe('/test/index.test.ts', () => {
  describe('wrapper normal event', () => {
    it('should wrap in init function', async () => {
      const handle = asyncWrapper(async context => {
        return context.data;
      });
      const res: any = await test(handle).run({ data: 1 });
      assert.equal(res, 1);
    });

    it('should wrap with event and context', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, event) => {
          return event.data;
        })(...args);
      });
      const res: any = await test(handle).run({ data: 1 }, {});
      assert.equal(res, 1);
    });
  });

  describe('wrapper web event', () => {
    it('should ok with plain text', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = 'hello world!';
        })(...args);
      });
      const res: any = await test(handle).runHttp(
        require('../resource/event'),
        {}
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.equal(res.body, 'hello world!');
    });

    it('should ok with json', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = { ok: true };
        })(...args);
      });
      const res = await test(handle).runHttp(require('../resource/event'), {});
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with raw json', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.type = 'application/json';
          ctx.body = '{"ok":true}';
        })(...args);
      });
      const res = await test(handle).runHttp(require('../resource/event'), {});
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with raw json/object', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.type = 'application/json';
          ctx.body = { ok: true };
        })(...args);
      });
      const res = await test(handle).runHttp(require('../resource/event'), {});
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      assert.equal(res.body, '{"ok":true}');
    });

    it('should ok with Buffer', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = Buffer.from('hello world!');
        })(...args);
      });
      const res = await test(handle).runHttp(require('../resource/event'), {});
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/octet-stream');
      assert.equal(res.body, Buffer.from('hello world!').toString('base64'));
    });

    it('should ok with context', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          ctx.body = ctx.query.hello;
        })(...args);
      });
      const res = await test(handle).runHttp(
        {
          path: '/',
          httpMethod: 'GET',
          headers: { 'content-type': 'text/plain' },
          queryStringParameters: { hello: 'world' },
          body: null,
          isBase64Encoded: false,
        },
        {}
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.body, 'world');
    });

    it('should ok with error', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          throw new Error('oops');
        })(...args);
      });
      const result = await test(handle).runHttp(require('../resource/event'), {});
      expect(result).toMatchSnapshot();
    });

    it('should ok with non-async function', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(ctx => {})(...args);
      });
      let err;
      try {
        await test(handle).runHttp(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }
      assert.ok(err);
      assert.equal(err.message, 'Must be an AsyncFunction');
    });

    it('should ok with asyncWrap', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, event) => {
          return 'hello world!';
        })(...args);
      });
      const res = await test(handle).run({ data: 1 }, {});
      assert.equal(res, 'hello world!');
    });

    it('should ok with asyncWrap when error', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          throw new Error('ooops!');
        })(...args);
      });
      const result = await test(handle).run(require('../resource/event'), {});
      expect(result).toMatchSnapshot();
    });

    it('should ok with asyncWrap when not async functions', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(ctx => {})(...args);
      });
      let err;
      try {
        await test(handle).run(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }

      assert.ok(err);
      assert.equal(err.message, 'Must be an AsyncFunction');
    });

    it('GET should ok', async () => {
      const runtime = await start();
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
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: q,
        body: '',
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(event, {});
      const body = JSON.parse(data.body);
      assert.equal(body.path, '/wechat');
      assert.equal(body.method, 'GET');
      assert.equal(body.query.echostr, 'hehe');
    });

    it('GET should ok', async () => {
      const runtime = await start();
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
        httpMethod: 'GET',
        headers: { 'content-type': 'text/plain' },
        queryStringParameters: q,
        body: Buffer.from('hello world').toString('base64'),
        isBase64Encoded: true,
      };
      const data = await test(handle).runHttp(event, {});
      const body = JSON.parse(data.body);
      assert.equal(body.path, '/wechat');
      assert.equal(body.method, 'GET');
      assert.equal(body.query.echostr, 'hehe');
    });

    it('GET should use faas parameters to appoint parameter', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          ctx.body = user + ' hello';
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'GET',
        headers: { 'content-type': 'text/plain' },
        queryStringParameters: {
          FAAS_ARGS: 'harry',
        },
        body: null,
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'harry hello');
    });

    it('GET should get text if return data', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          return 'hello world ' + user;
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'GET',
        headers: { 'content-type': 'text/plain' },
        queryStringParameters: {
          FAAS_ARGS: 'harry',
        },
        body: null,
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'hello world harry');
    });

    it('GET should get params in post method', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, user) => {
          return 'hello world ' + user;
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'POST',
        headers: { 'content-type': 'text/plain' },
        queryStringParameters: {},
        body: {
          FAAS_ARGS: ['harry'],
        },
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'hello world harry');
    });

    it('should ok with asyncWrap use appoint args in event', async () => {
      const runtime = await start();
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
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async ctx => {
          return ctx.request.body.toString();
        })(...args);
      });
      const postData = JSON.stringify({ name: 'fc request' });
      const data = await test(handle).runHttp(
        {
          path: '/',
          headers: { 'content-type': 'text/plain' },
          queryStringParameters: {},
          httpMethod: 'POST',
          body: postData,
          isBase64Encoded: false,
        },
        {}
      );
      assert.equal(data.body, postData);
    });
  });

  describe('test base info', () => {
    it('should get function name and service name from environment', async () => {
      mm(process.env, 'AWS_LAMBDA_FUNCTION_NAME',  'aaa');
      const runtime = await start();
      expect(runtime.getFunctionName()).toEqual('aaa');
      expect(runtime.getFunctionServiceName()).toEqual('');
      mm.restore();
    });
  })
});
