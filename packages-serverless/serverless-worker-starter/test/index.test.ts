import { sleep } from '@midwayjs/runtime-mock';
import * as assert from 'assert';
import { eventRespondWith, eventWaitUntil, start } from '../src';
import type { JSWorkerExtendableEvent, JSWorkerFetchEvent } from '@midwayjs/jsdom-service-worker';

declare class ExtendableEvent extends Event implements ExtendableEvent  {}
declare class FetchEvent extends Event implements ExtendableEvent { constructor(type, init: FetchEventInit); }

describe('test/index.test.ts', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  });

  describe('event listener handlers', () => {
    it('eventWaitUntil', async () => {
      let count = 0;
      const handle = eventWaitUntil(async () => {
        await sleep(100);
        count++;
      });
      const target = new EventTarget();
      target.addEventListener('install', handle);
      const event = new ExtendableEvent('install') as unknown as JSWorkerExtendableEvent;
      target.dispatchEvent(event);
      await Promise.all(event._extendLifeTimePromises);
      assert.strictEqual(count, 1);
    });

    it('eventRespondWith', async () => {
      let count = 0;
      const handle = eventRespondWith(async (event) => {
        const { request } = event;
        await sleep(100);
        count++;
        return new Response(request.body);
      });
      const target = new EventTarget();
      target.addEventListener('fetch', handle);
      const event = new FetchEvent('fetch', {
        request: new Request('http://example.com', {
          method: 'POST',
          body: 'foobar',
        }),
      }) as unknown as JSWorkerFetchEvent;
      target.dispatchEvent(event);
      await Promise.resolve(event._respondWithPromise);
      const response = event._potentialResponse;
      assert(response != null);
      const text = await response.text();
      assert.strictEqual(count, 1);
      assert.strictEqual(text, 'foobar');
    });
  });


  describe('handle fetch event', () => {
    const cases = [
      {
        name: 'plain text body',
        handler: async (ctx) => {
          ctx.body = 'hello world!';
        },
        input: {},
        expect: {
          status: 200,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
          },
          body: 'hello world!',
        },
      },
      {
        name: 'json body',
        handler: async (ctx) => {
          ctx.body = { ok: true };
        },
        input: {},
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: '{"ok":true}',
        },
      },
      {
        name: 'serialized json body with ctx.type',
        handler: async (ctx) => {
          ctx.type = 'application/json';
          ctx.body = '{"ok":true}';
        },
        input: {},
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: '{"ok":true}',
        },
      },
      {
        name: 'json body with ctx.type',
        handler: async (ctx) => {
          ctx.type = 'application/json';
          ctx.body = { ok: true };
        },
        input: {},
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: '{"ok":true}',
        },
      },
      {
        name: 'Buffer body',
        handler: async (ctx) => {
          ctx.body = Buffer.from('hello world!');
        },
        input: {},
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/octet-stream',
          },
          body: Buffer.from('hello world!'),
        },
      },
      {
        name: 'ctx query',
        handler: async (ctx) => {
          ctx.body = ctx.query.requestId;
        },
        input: {
          url: 'http://example.com/?requestId=foobar',
          requestInit: {},
        },
        expect: {
          status: 200,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
          },
          body: 'foobar',
        },
      },
      {
        name: 'rejection',
        handler: async (ctx) => {
          throw new Error('oops');
        },
        input: {},
        expect: {
          status: 500,
          body: 'Internal Server Error',
        },
      },
      {
        name: 'non-async-function',
        handler: (ctx) => {
          return sleep(100).then(() => {
            ctx.body = 'foobar';
          });
        },
        input: {},
        expect: {
          status: 200,
          body: 'foobar',
        },
      },
      {
        name: 'ctx properties',
        handler: async (ctx) => {
          ctx.body = {
            path: ctx.path,
            method: ctx.method,
            query: ctx.query,
            headers: ctx.headers,
            body: ctx.request.body,
          };
        },
        input: {
          url: 'http://example.com/wechat?query_item=foobar',
          requestInit: {
            method: 'POST',
            headers: {},
            body: 'foobar',
          },
        },
        expect: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            path: '/wechat',
            method: 'POST',
            query: {
              query_item: 'foobar',
            },
            headers: {
              'content-type': 'text/plain;charset=UTF-8',
            },
            body: 'foobar',
          }),
        },
      },
    ];

    for (const item of cases) {
      it(`case: ${item.name}`, async () => {
        const runtime = await start({});
        const handle = eventRespondWith(async (...args) => {
          return runtime.asyncEvent(item.handler)(...args);
        });
        const target = new EventTarget();
        target.addEventListener('fetch', handle);
        const event = new FetchEvent('fetch', {
          request: new Request(
            item.input.url ?? 'http://example.com',
            item.input.requestInit as any),
        }) as unknown as JSWorkerFetchEvent;
        target.dispatchEvent(event);
        await Promise.resolve(event._respondWithPromise);
        const response = event._potentialResponse;
        assert(response != null);
        await assertResponse(response, item.expect);
      });
    }
  });
});

const decoder = new TextDecoder();
async function assertResponse(response: Response, expected) {
  if (expected.status !== undefined) {
    assert.strictEqual(response.status, expected.status);
  } else {
    assert.strictEqual(response.status, 200);
  }
  if (expected.headers !== undefined) {
    for (const [key, val] of Object.entries(expected.headers)) {
      assert.strictEqual(response.headers.get(key), val);
    }
  }
  const data = await response.arrayBuffer();
  if (typeof expected.body === 'string') {
    assert.strictEqual(decoder.decode(data), expected.body);
  } else if (expected.body != null) {
    const actual = Buffer.from(data);
    const expectedData = Buffer.from(expected.body);
    assert.ok(actual.equals(expectedData), `Expect:
${expectedData.toString()}

Actual:
${actual.toString()}`);
  }
}
