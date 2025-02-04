import { createLightApp } from '@midwayjs/mock';
import * as EventEmitterModule from '../src';
import { OnEvent } from '../src';
import { Singleton, sleep } from '@midwayjs/core';

describe('test event emitter', () => {
  it('should work', async () => {

    const fn = jest.fn();
    @Singleton()
    class Test {
      @OnEvent('test')
      async test() {
        fn();
      }
    }

    const app = await createLightApp({
      imports: [
        EventEmitterModule,
      ],
      preloadModules: [Test],
    });

    await app.getApplicationContext().getAsync(Test);

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('test');
    expect(fn).toHaveBeenCalled();
  });

  it('should work with event parameters', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestWithParams {
      @OnEvent('user.created')
      async handleUserCreated(userId: number, data: any) {
        fn(userId, data);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestWithParams],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('user.created', 123, { name: 'test' });
    expect(fn).toHaveBeenCalledWith(123, { name: 'test' });
  });

  it('should work with wildcard events', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestWildcard {
      @OnEvent('user.*')
      async handleUserEvents(event: string, ...args: any[]) {
        fn(event, ...args);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      globalConfig: {
        eventEmitter: {
          wildcard: true,
          verboseMemoryLeak: true
        },
      },
      preloadModules: [TestWildcard],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('user.login', 'user1');
    await eventEmitter.emitAsync('user.logout', 'user1');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'user1');
    expect(fn).toHaveBeenNthCalledWith(2, 'user1');
  });

  it('should work with multiple handlers for same event', async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    @Singleton()
    class TestMultipleHandlers {
      @OnEvent('notification')
      async handler1(msg: string) {
        fn1(msg);
      }

      @OnEvent('notification')
      async handler2(msg: string) {
        fn2(msg);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestMultipleHandlers],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('notification', 'hello');

    expect(fn1).toHaveBeenCalledWith('hello');
    expect(fn2).toHaveBeenCalledWith('hello');
  });

  it('should handle errors in event handlers', async () => {
    const errorFn = jest.fn();

    @Singleton()
    class TestErrorHandling {
      @OnEvent('error.event', {
        suppressErrors: false
      })
      async handleError() {
        throw new Error('Test error');
      }

      @OnEvent('error')
      async handleErrorEvent(error: Error) {
        errorFn(error.message);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestErrorHandling],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await expect(eventEmitter.emitAsync('error.event')).rejects.toThrow('Test error');
  });

  it('should work with namespace events', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestNamespace {
      @OnEvent('namespace::event')
      async handleNamespaceEvent(data: any) {
        fn(data);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestNamespace],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('namespace::event', { test: true });

    expect(fn).toHaveBeenCalledWith({ test: true });
  });

  it('should work with once event', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestOnce {
      @OnEvent('test.once')
      async handleOnce(data: string) {
        fn(data);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestOnce],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('test.once', 'first');
    await eventEmitter.emitAsync('test.once', 'second');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });

  it('should work with removeListener', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestRemoveListener {
      @OnEvent('test.remove')
      async handleRemove(data: string) {
        fn(data);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestRemoveListener],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    const ee = eventEmitter.getEventEmitter();

    await eventEmitter.emitAsync('test.remove', 'before');
    ee.removeAllListeners('test.remove');
    await eventEmitter.emitAsync('test.remove', 'after');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('before');
  });

  it('should work with concurrent events', async () => {
    const results: number[] = [];

    @Singleton()
    class TestConcurrent {
      @OnEvent('concurrent')
      async handleConcurrent(delay: number) {
        await new Promise(resolve => setTimeout(resolve, delay));
        results.push(delay);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestConcurrent],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);

    await Promise.all([
      eventEmitter.emitAsync('concurrent', 30),
      eventEmitter.emitAsync('concurrent', 10),
      eventEmitter.emitAsync('concurrent', 20),
    ]);

    expect(results).toEqual([10, 20, 30]);
  });

  it('should work with sync emit', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestSyncEmit {
      @OnEvent('sync.event')
      async handleSync(data: string) {
        fn(data);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestSyncEmit],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    eventEmitter.emit('sync.event', 'sync data');

    await sleep(100);

    expect(fn).toHaveBeenCalledWith('sync data');
  });

  it('should work with sync emit and multiple parameters', async () => {
    const fn = jest.fn();

    @Singleton()
    class TestSyncEmitMultiParams {
      @OnEvent('sync.multi')
      async handleSyncMulti(param1: string, param2: number, param3: boolean) {
        fn(param1, param2, param3);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestSyncEmitMultiParams],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    eventEmitter.emit('sync.multi', 'test', 123, true);

    await sleep(100);

    expect(fn).toHaveBeenCalledWith('test', 123, true);
  });

  it('should work with both sync and async emit', async () => {
    const syncFn = jest.fn();
    const asyncFn = jest.fn();

    @Singleton()
    class TestMixedEmit {
      @OnEvent('mixed.event')
      async handleMixed(data: string) {
        if (data === 'sync') {
          syncFn(data);
        } else {
          asyncFn(data);
        }
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestMixedEmit],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);

    eventEmitter.emit('mixed.event', 'sync');
    await eventEmitter.emitAsync('mixed.event', 'async');

    expect(syncFn).toHaveBeenCalledWith('sync');
    expect(asyncFn).toHaveBeenCalledWith('async');
  });

  it('should work with async option in OnEvent decorator', async () => {
    const fn = jest.fn();
    const events: string[] = [];

    @Singleton()
    class TestAsyncOption {
      @OnEvent('order.created', { async: true })
      async handleOrderCreated(orderId: string) {
        await sleep(50);  // 模拟异步处理
        events.push('async:' + orderId);
        fn(orderId);
      }

      @OnEvent('order.created')
      async handleOrderCreatedSync(orderId: string) {
        events.push('sync:' + orderId);
        fn(orderId);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestAsyncOption],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);

    // 发送事件
    await eventEmitter.emitAsync('order.created', 'order-1');

    // 验证执行顺序，同步处理应该先完成
    expect(events).toEqual(['sync:order-1', 'async:order-1']);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('order-1');
  });

  it('should work with complex object payload', async () => {
    const fn = jest.fn();

    interface OrderCreatedEvent {
      orderId: string;
      userId: number;
      items: Array<{
        id: string;
        quantity: number;
        price: number;
      }>;
      metadata: {
        platform: string;
        timestamp: number;
      };
    }

    @Singleton()
    class TestObjectPayload {
      @OnEvent('order.created', { async: true })
      async handleOrderCreated(payload: OrderCreatedEvent) {
        fn(payload);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestObjectPayload],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);

    const orderEvent: OrderCreatedEvent = {
      orderId: 'ORDER_123',
      userId: 456,
      items: [
        {
          id: 'ITEM_1',
          quantity: 2,
          price: 100
        },
        {
          id: 'ITEM_2',
          quantity: 1,
          price: 200
        }
      ],
      metadata: {
        platform: 'web',
        timestamp: Date.now()
      }
    };

    await eventEmitter.emitAsync('order.created', orderEvent);

    expect(fn).toHaveBeenCalledWith(orderEvent);
    const receivedEvent = fn.mock.calls[0][0];
    expect(receivedEvent.orderId).toBe('ORDER_123');
    expect(receivedEvent.items).toHaveLength(2);
    expect(receivedEvent.items[0].quantity).toBe(2);
    expect(receivedEvent.metadata.platform).toBe('web');
  });

  it('should work with prependListener option', async () => {
    const events: string[] = [];

    @Singleton()
    class TestPrependListener {
      @OnEvent('test.prepend', { prependListener: true })
      async handlePrepend() {
        events.push('prepend');
      }

      @OnEvent('test.prepend')
      async handleNormal() {
        events.push('normal');
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestPrependListener],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    await eventEmitter.emitAsync('test.prepend');

    // prependListener 的处理器应该先执行
    expect(events).toEqual(['prepend', 'normal']);
  });

  it('should work with suppressErrors option', async () => {
    const errorFn = jest.fn();

    @Singleton()
    class TestSuppressErrors {
      @OnEvent('test.error.suppress', { suppressErrors: true })
      async handleSuppressError() {
        throw new Error('Suppressed error');
      }

      @OnEvent('test.error.throw', { suppressErrors: false })
      async handleWithError() {
        throw new Error('Test error');
      }

      @OnEvent('error')
      async handleError(error: Error) {
        errorFn(error.message);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestSuppressErrors],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);

    // 测试 suppressErrors: true 的情况
    await eventEmitter.emitAsync('test.error.suppress');
    expect(errorFn).not.toHaveBeenCalled();

    // 测试 suppressErrors: false 的情况
    await expect(eventEmitter.emitAsync('test.error.throw')).rejects.toThrow('Test error');
  });

  it('should work with both prependListener and suppressErrors', async () => {
    const events: string[] = [];
    const errorFn = jest.fn();

    @Singleton()
    class TestCombinedOptions {
      @OnEvent('test.combined', { prependListener: true, suppressErrors: true })
      async handleCombined() {
        events.push('first');
        throw new Error('This error should be suppressed');
      }

      @OnEvent('test.combined')
      async handleNormal() {
        events.push('second');
      }

      @OnEvent('error')
      async handleError(error: Error) {
        errorFn(error.message);
      }
    }

    const app = await createLightApp({
      imports: [EventEmitterModule],
      preloadModules: [TestCombinedOptions],
    });

    const eventEmitter = await app.getApplicationContext().getAsync(EventEmitterModule.EventEmitterService);
    
    // 错误被抑制，两个处理器都应该执行
    await eventEmitter.emitAsync('test.combined');

    // 验证执行顺序和错误处理
    expect(events).toEqual(['first', 'second']);
    expect(errorFn).not.toHaveBeenCalled();
  });
});

