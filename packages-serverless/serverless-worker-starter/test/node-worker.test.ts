/**
 * @jest-environment node
 */

import { sleep } from '@midwayjs/runtime-mock';
import { start, asyncWrapper } from '../src';
import { IncomingMessage, ServerResponse } from './helper/request_response';

class Tester {
  handler;

  constructor(handler) {
    this.handler = handler;
  }

  async runHttp(context = {}, req, res) {
    const args = [context, req, res];
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

describe('test/node-worker.test.ts', () => {

  describe('handle event', () => {
    it('event success', async () => {
      const runtime = await start({});
      const request = new IncomingMessage({
        url: 'event://alice-event-invoke/',
        method: 'alice-event-invoke',
        headers: new Map([['traceid', 'traceId']])
      });

      request.push('test');
      request.push(null);

      const response = new ServerResponse();

      const entryRequest = [
        {
          Dapr: {
            ['1.0']: {}
          }
        },
        request,
        response
      ];

      const handle = asyncWrapper(async (...args) => {
        return runtime.asyncEvent((ctx) => {
          return ctx.originEvent + ctx.originContext.traceid;
        })(...args);
      });

      const res: any = await test(handle).run(...entryRequest);
      expect(res.data.toString()).toEqual('testtraceId');
    });
  });

  describe('handle http', () => {
    const cases = [
      {
        name: 'get request',
        request: {
          url: 'http://dont.care/?name=test',
          method: 'GET',
          headers: new Map()
        },
        body: 'ignore',
        handler: (ctx) => {
          return `hello,${ctx.query.name},${ctx.request.body}`;
        },
        expect: {
          data: Buffer.from('hello,test,undefined')
        }
      },
      {
        name: 'post request',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map()
        },
        body: 'world',
        handler: (ctx) => {
          return `hello ${ctx.request.body}`;
        },
        expect: {
          data: Buffer.from('hello world')
        }
      },
      {
        name: 'post request with json data',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map([['content-type', 'application/json']])
        },
        body: '{"name": "world"}',
        handler: (ctx) => {
          return `hello ${ctx.request.body.name}`;
        },
        expect: {
          data: Buffer.from('hello world')
        }
      },
      {
        name: 'plain text body',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map()
        },
        handler: async (ctx) => {
          ctx.body = 'hello world!';
        },
        body: '',
        expect: {
          status: 200,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
          },
          data: Buffer.from('hello world!'),
        },
      },
      {
        name: 'json body',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map()
        },
        handler: async (ctx) => {
          ctx.body = { ok: true };
        },
        body: '',
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          data: Buffer.from('{"ok":true}'),
        },
      },
      {
        name: 'serialized json body with ctx.type',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map()
        },
        handler: async (ctx) => {
          ctx.type = 'application/json';
          ctx.body = '{"ok":true}';
        },
        body: '',
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          data: Buffer.from('{"ok":true}'),
        },
      },
      {
        name: 'Buffer body',
        request: {
          url: 'http://dont.care/',
          method: 'POST',
          headers: new Map()
        },
        handler: async (ctx) => {
          ctx.body = Buffer.from('hello world!');
        },
        body: '',
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/octet-stream',
          },
          data: Buffer.from('hello world!'),
        },
      },
      {
        name: 'ctx query',
        request: {
          url: 'http://example.com/?requestId=foobar',
          method: 'GET',
          headers: new Map()
        },
        handler: async (ctx) => {
          ctx.body = ctx.query.requestId;
        },
        body: '',
        expect: {
          status: 200,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
          },
          data: Buffer.from('foobar'),
        },
      },
      {
        name: 'rejection',
        request: {
          url: 'http://dont.care/',
          method: 'GET',
          headers: new Map()
        },
        handler: async (ctx) => {
          throw new Error('oops');
        },
        body: '',
        expect: {
          status: 500,
          data: Buffer.from('Internal Server Error'),
        },
      },
      {
        name: 'non-async-function',
        request: {
          url: 'http://dont.care/',
          method: 'GET',
          headers: new Map()
        },
        handler: (ctx) => {
          return sleep(100).then(() => {
            ctx.body = 'foobar';
          });
        },
        body: '',
        expect: {
          status: 200,
          data: Buffer.from('foobar'),
        },
      },
      {
        name: 'ctx properties',
        request: {
          url: 'http://example.com/wechat?query_item=foobar',
          method: 'POST',
          headers: new Map([['content-type', 'text/plain;charset=UTF-8']]),
        },
        handler: async (ctx) => {
          ctx.body = {
            path: ctx.path,
            method: ctx.method,
            query: ctx.query,
            headers: ctx.headers,
            body: ctx.request.body.toString(),
          };
        },
        body: 'foobar',
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          data: Buffer.from(JSON.stringify({
            path: '/wechat',
            method: 'POST',
            query: {
              query_item: 'foobar',
            },
            headers: {
              'content-type': 'text/plain;charset=UTF-8',
            },
            body: 'foobar',
          })),
        },
      },
    ];

    for (const item of cases) {
      it(`case: ${item.name}`, async () => {
        const runtime = await start({});
        const handle = asyncWrapper(async (...args) => {
          return runtime.asyncEvent(item.handler)(...args);
        });

        const request = new IncomingMessage(item.request);

        if (item.body) {
          request.push(item.body);
        }
        request.push(null);

        const response = new ServerResponse();

        await test(handle).runHttp({
          Dapr: {
            ['1.0']: {
              invoke() {},
              binding() {}
            }
          }
        }, request, response);

        assertResponse(response, item.expect);
      });
    }
  });
});

async function assertResponse(response: ServerResponse, expected) {
  if (expected.status !== undefined) {
    expect(response.statusCode).toEqual(expected.status);
  } else {
    expect(response.statusCode).toEqual(200);
  }

  if (expected.headers !== undefined) {
    for (const [key, val] of Object.entries(expected.headers)) {
      expect(response.getHeader(key)).toEqual(val);
    }
  }

  expect(response.data).toEqual(expected.data);
}