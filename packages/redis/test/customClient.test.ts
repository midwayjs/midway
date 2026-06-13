import { EventEmitter } from 'events';
import { close, createLightApp } from '@midwayjs/mock';
import * as redis from '../src';

describe('/test/customClient.test.ts', () => {
  class CustomRedis extends EventEmitter {
    status = 'connecting';

    constructor(public config: any) {
      super();
      queueMicrotask(() => {
        this.status = 'ready';
        this.emit('ready');
      });
    }

    sendCommand(command: any) {
      return Promise.resolve(command?.name);
    }

    async get() {
      return 'custom';
    }

    async quit() {
      this.status = 'end';
    }
  }

  it('should create a custom client from client config', async () => {
    const app = await createLightApp('', {
      imports: [redis],
      globalConfig: {
        redis: {
          client: {
            customClientClass: CustomRedis,
            host: '127.0.0.1',
            port: 6379,
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(redis.RedisServiceFactory);

    expect(factory.get()).toBeInstanceOf(CustomRedis);

    await close(app);
  });

  it('should create custom clients and keep factory/service injection', async () => {
    const app = await createLightApp('', {
      imports: [redis],
      globalConfig: {
        redis: {
          clients: {
            default: {
              customClientClass: CustomRedis,
              host: '127.0.0.1',
              port: 6379,
            },
            cache: {
              customClientClass: CustomRedis,
              host: '127.0.0.1',
              port: 6380,
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(redis.RedisServiceFactory);
    const service = await app.getApplicationContext().getAsync(redis.RedisService);
    const defaultClient = factory.get<CustomRedis>();
    const cacheClient = factory.get<CustomRedis>('cache');

    expect(defaultClient).toBeInstanceOf(CustomRedis);
    expect(cacheClient).toBeInstanceOf(CustomRedis);
    expect(defaultClient.config.customClientClass).toBeUndefined();
    expect(cacheClient.config.port).toBe(6380);
    expect(await service.get('key')).toBe('custom');

    await close(app);
  });

  it('should reject when custom client emits error', async () => {
    class ErrorRedis extends EventEmitter {
      status = 'connecting';

      constructor(config: any) {
        super();
        expect(config.customClientClass).toBeUndefined();
        queueMicrotask(() => this.emit('error', new Error('connection failed')));
      }

      async quit() {}
    }

    await expect(
      createLightApp('', {
        imports: [redis],
        globalConfig: {
          redis: {
            client: {
              customClientClass: ErrorRedis,
              host: '127.0.0.1',
              port: 6379,
            },
          },
        },
      })
    ).rejects.toThrow('connection failed');
  });

  it('should bind trace context to custom client', async () => {
    const factory = new redis.RedisServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = { runWithExitSpan };
    (factory as any).logger = { info: jest.fn(), error: jest.fn() };

    const client: any = await (factory as any).createClient(
      {
        customClientClass: CustomRedis,
        host: '127.0.0.1',
        port: 6379,
      },
      'default'
    );

    expect(await client.sendCommand({ name: 'GET' })).toBe('GET');
    expect(runWithExitSpan).toHaveBeenCalledTimes(1);
  });
});
