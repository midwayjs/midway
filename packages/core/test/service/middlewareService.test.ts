import { MidwayMiddlewareService, MidwayContainer } from '../../src';
import { Provide } from '@midwayjs/decorator';
import * as assert from 'assert';

describe('/test/services/middlewareService.test.ts', () => {

  describe('test compose', () => {

    let middlewareService = null;

    beforeEach(async () => {
      const container = new MidwayContainer();
      container.bindClass(MidwayMiddlewareService);
      middlewareService = await container.getAsync(MidwayMiddlewareService, [container]);
    });

    it('should work', async () => {
      const arr = [];
      const stack = [];

      stack.push(async (context, next) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        arr.push(6);
      });

      stack.push(async (context, next) => {
        arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        arr.push(5);
      });

      stack.push(async (context, next) => {
        arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        arr.push(4);
      });

      await (await middlewareService.compose(stack))({});
      expect(arr).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]));
    });

    it('should be able to be called twice', async () => {
      const stack = []

      stack.push(async (context, next) => {
        context.arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(6);
      });

      stack.push(async (context, next) => {
        context.arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(5);
      });

      stack.push(async (context, next) => {
        context.arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(4);
      });

      const fn = await middlewareService.compose(stack);
      const ctx1 = { arr: [] }
      const ctx2 = { arr: [] }
      const out = [1, 2, 3, 4, 5, 6]

      return fn(ctx1).then(() => {
        assert.deepEqual(out, ctx1.arr);
        return fn(ctx2);
      }).then(() => {
        assert.deepEqual(out, ctx2.arr);
      });
    });

    it('should create next functions that return a Promise', async () => {
      const stack = []
      const arr = []
      for (let i = 0; i < 5; i++) {
        stack.push((context, next) => {
          arr.push(next());
        });
      }

      await (await middlewareService.compose(stack))({});

      for (const next of arr) {
        assert(isPromise(next), 'one of the functions next is not a Promise');
      }
    });

    it('should work with 0 middleware', async () => {
      return (await middlewareService.compose([]))({});
    });

    it('should work when yielding at the end of the stack', async () => {
      const stack = []
      let called = false

      stack.push(async (ctx, next) => {
        await next();
        called = true
      });

      await (await middlewareService.compose(stack))({});
      assert(called);
    });

    it('should reject on errors in middleware', async () => {
      const stack = []

      stack.push(() => { throw new Error() });

      return (await middlewareService.compose(stack))({})
        .then(() => {
          throw new Error('promise was not rejected');
        }, (e) => {
          expect(e).toBeInstanceOf(Error);
        });
    });

    it('should keep the context', async () => {
      const ctx = {}

      const stack = []

      stack.push(async (ctx2, next) => {
        await next();
        expect(ctx2).toEqual(ctx);
      });

      stack.push(async (ctx2, next) => {
        await next();
        expect(ctx2).toEqual(ctx);
      });

      stack.push(async (ctx2, next) => {
        await next();
        expect(ctx2).toEqual(ctx);
      });

      return (await middlewareService.compose(stack))(ctx)
    });

    it('should catch downstream errors', async () => {
      const arr = []
      const stack = []

      stack.push(async (ctx, next) => {
        arr.push(1);
        try {
          arr.push(6);
          await next();
          arr.push(7);
        } catch (err) {
          arr.push(2);
        }
        arr.push(3);
      });

      stack.push(async (ctx, next) => {
        arr.push(4);
        throw new Error();
      });

      await (await middlewareService.compose(stack))({});
      expect(arr).toEqual([1, 6, 4, 2, 3]);
    });

    it('should compose w/ next', async () => {
      let called = false

      return (await middlewareService.compose([]))({}, async () => {
        called = true
      }).then(function () {
        assert(called);
      });
    });

    it('should handle errors in wrapped non-async functions', async () => {
      const stack = []

      stack.push(function () {
        throw new Error();
      });

      return (await middlewareService.compose(stack))({}).then(() => {
        throw new Error('promise was not rejected');
      }, (e) => {
        expect(e).toBeInstanceOf(Error);
      });
    });

    // https://github.com/koajs/compose/pull/27#issuecomment-143109739
    it('should compose w/ other compositions', async () => {
      const called = []

      return (await middlewareService.compose([
        await middlewareService.compose([
          (ctx, next) => {
            called.push(1);
            return next();
          },
          (ctx, next) => {
            called.push(2);
            return next();
          }
        ]),
        (ctx, next) => {
          called.push(3);
          return next();
        }
      ]))({}).then(() => assert.deepEqual(called, [1, 2, 3]));
    });

    it('should throw if next() is called multiple times', async () => {
      return (await middlewareService.compose([
        async (ctx, next) => {
          await next();
          await next();
        }
      ]))({}).then(() => {
        throw new Error('boom');
      }, (err) => {
        assert(/multiple times/.test(err.message));
      });
    });

    it('should return a valid middleware', async () => {
      let val = 0
      return (await middlewareService.compose([
       await middlewareService.compose([
          (ctx, next) => {
            val++
            return next();
          },
          (ctx, next) => {
            val++
            return next();
          }
        ]),
        (ctx, next) => {
          val++
          return next();
        }
      ]))({}).then(function () {
        expect(val).toEqual(3);
      });
    });

    it('should return last return value', async () => {
      const stack = []

      stack.push(async (context, next) => {
        const val = await next();
        expect(val).toEqual(2);
        return 1
      });

      stack.push(async (context, next) => {
        const val = await next();
        expect(val).toEqual(0);
        return 2
      });

      const next = () => 0
      return (await middlewareService.compose(stack))({}, next).then(function (val) {
        expect(val).toEqual(1);
      });
    });

    it('should not affect the original middleware array', () => {
      const middleware = []
      const fn1 = (ctx, next) => {
        return next();
      }
      middleware.push(fn1);

      for (const fn of middleware) {
        assert.equal(fn, fn1);
      }

      middlewareService.compose(middleware);

      for (const fn of middleware) {
        assert.equal(fn, fn1);
      }
    });

    it('should not get stuck on the passed in next', async () => {
      const middleware = [(ctx, next) => {
        ctx.middleware++
        return next();
      }]
      const ctx = {
        middleware: 0,
        next: 0
      }

      return (await middlewareService.compose(middleware))(ctx, (ctx, next) => {
        ctx.next++
        return next();
      }).then(() => {
        expect(ctx).toEqual({ middleware: 1, next: 1 });
      });
    });
  });


  describe('test middlewareService', () => {
    it('middleware service should be ok', async() => {

      @Provide()
      class TestMiddleware1 {
        resolve() {
          return async (ctx, next) => {
            return 'hello ' + await next();
          }
        }
      }

      @Provide()
      class TestMiddleware2 {
        resolve() {
          return async (ctx, next) => {
            return 'world'
          }
        }
      }

      const container = new MidwayContainer();
      container.bindClass(MidwayMiddlewareService);
      container.bindClass(TestMiddleware1);
      container.bindClass(TestMiddleware2);

      const middlewareService = await container.getAsync(MidwayMiddlewareService, [container]);
      const fn = await middlewareService.compose([TestMiddleware1, TestMiddleware2]);
      const result = await fn({}, () => {
        console.log('end');
      });

      expect(result).toEqual('hello world');
    });

    it('test compose with compose should be ok', async() => {

      @Provide()
      class TestMiddleware1 {
        resolve() {
          return async (ctx, next) => {
            return 'hello ' + await next();
          }
        }
      }

      @Provide()
      class TestMiddleware2 {
        resolve() {
          return async (ctx, next) => {
            return 'world'
          }
        }
      }

      const container = new MidwayContainer();
      container.bindClass(MidwayMiddlewareService);
      container.bindClass(TestMiddleware1);
      container.bindClass(TestMiddleware2);

      const middlewareService = await container.getAsync(MidwayMiddlewareService, [container]);
      const fn = await middlewareService.compose([TestMiddleware1]);
      const fn2 = await middlewareService.compose([fn, TestMiddleware2]);
      const result = await fn2({});

      expect(result).toEqual('hello world');
    });

  });

});

function wait (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1));
}

function isPromise (x) {
  return x && typeof x.then === 'function'
}
