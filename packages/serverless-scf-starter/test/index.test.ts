import * as assert from 'assert';
import { asyncWrapper, start } from '../src';

class Tester {
  handler;

  constructor(handler) {
    this.handler = handler;
  }

  async runHttp(event, context = {}) {
    const args = [
      Object.assign({}, require('../resource/event'), event),
      context,
    ];
    const result = await this.handler.apply(this.handler, args);
    return result;
  }

  run(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
      return this.handler.apply(this, args);
    });
  }
}

function test(handler) {
  return new Tester(handler);
}

describe('/test/index.test.ts', () => {
  describe('wrapper normal event', () => {
    it('should wrap in init function', async () => {
      const handle = asyncWrapper(async (context) => {
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

  describe('wrapper web event scf', () => {
    it('should ok with plain text', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
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
        return runtime.asyncEvent(async (ctx) => {
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
        return runtime.asyncEvent(async (ctx) => {
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
        return runtime.asyncEvent(async (ctx) => {
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
        return runtime.asyncEvent(async (ctx) => {
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
        return runtime.asyncEvent(async (ctx) => {
          ctx.body = ctx.query.hello;
        })(...args);
      });
      const res = await test(handle).runHttp(
        {
          path: '/',
          httpMethod: 'GET',
          headers: { 'content-type': 'text/plain' },
          queryString: { hello: 'world' },
          body: null,
        },
        {}
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.body, 'world');
    });

    it('should ok with error', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
          throw new Error('oops');
        })(...args);
      });
      let err;
      try {
        await test(handle).runHttp(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }
      assert.ok(err);
      assert.equal(err.message, 'oops');
    });

    it('non-async should passed', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent((ctx) => {})(...args);
      });
      let err;
      try {
        await test(handle).runHttp(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }
      assert.ok(!err);
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
        return runtime.asyncEvent(async (ctx) => {
          throw new Error('ooops!');
        })(...args);
      });
      let err;
      try {
        await test(handle).run(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }

      assert.ok(err);
      assert.equal(err.message, 'ooops!');
    });

    it('should ok with asyncWrap when not async functions', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent((ctx) => {})(...args);
      });
      let err;
      try {
        await test(handle).run(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }

      assert.ok(!err);
    });

    it('should ok with empty functions', async () => {
      const runtime = await start();

      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent()(...args);
      });

      let err;
      let defaultRun = false;

      runtime.defaultInvokeHandler = () => {
        defaultRun = true;
      };

      try {
        await test(handle).run(require('../resource/event'), {});
      } catch (ex) {
        err = ex;
      }

      assert.ok(!err);
      assert.ok(defaultRun);
    });

    it('GET should ok', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
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
        queryString: q,
        body: '',
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
        return runtime.asyncEvent(async (ctx) => {
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
        queryString: q,
        body: Buffer.from('hello world').toString('base64'),
        isBase64Encoded: true,
      };
      const data = await test(handle).runHttp(event, {});
      const body = JSON.parse(data.body);
      assert.equal(body.path, '/wechat');
      assert.equal(body.method, 'GET');
      assert.equal(body.query.echostr, 'hehe');
    });

    it('GET should get text if return data', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
          return 'hello world ' + ctx.query.user;
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'GET',
        headers: { 'content-type': 'text/plain' },
        queryString: {
          user: 'harry',
        },
        body: null,
        isBase64Encoded: false,
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'hello world harry');
    });

    it('should get params in post method', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
          return 'hello world ' + ctx.req.body.user;
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'POST',
        headers: { 'content-type': 'application/json' },
        queryString: {},
        body: JSON.stringify({
          user: 'harry',
        }),
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'hello world harry');
    });

    it('should get urlencoded params in get method', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
          return 'hello world ' + ctx.req.body.user;
        })(...args);
      });
      const event = {
        path: '/',
        httpMethod: 'GET',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        queryString: {},
        body: 'user=harry',
      };
      const data = await test(handle).runHttp(event, {});
      assert(data.body === 'hello world harry');
    });

    it('should ok with asyncWrap use appoint args in event', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx, data) => {
          return 'hello world!' + data.name;
        })(...args);
      });
      const res = await test(handle).run(
        {
          name: 'harry',
        },
        ''
      );
      assert.equal(res, 'hello world!harry');
    });

    it('POST should ok use scf request with body', async () => {
      const runtime = await start();
      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent(async (ctx) => {
          return ctx.request.body;
        })(...args);
      });
      const postData = JSON.stringify({ name: 'fc request' });
      const data = await test(handle).runHttp(
        {
          path: '/',
          headers: { 'content-type': 'text/plain' },
          queryString: {},
          httpMethod: 'POST',
          body: postData,
        },
        {}
      );
      assert.equal(data.body, postData);
    });
  });
});
