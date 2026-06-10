import { close, createLightApp } from '@midwayjs/mock';
import * as consul from '../src';

describe('/test/customClient.test.ts', () => {
  class CustomConsul {
    constructor(public config: any) {}

    request(options: any) {
      return Promise.resolve(options.method);
    }

    destroy() {}
  }

  it('should create a custom client from merged default config', async () => {
    const app = await createLightApp({
      imports: [consul],
      globalConfig: {
        consul: {
          default: {
            customClientClass: CustomConsul,
          },
          client: {
            host: 'default.local',
            port: 8500,
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(consul.ConsulServiceFactory);

    const client = factory.get<CustomConsul>();
    expect(client).toBeInstanceOf(CustomConsul);
    expect(client.config).toEqual({
      host: 'default.local',
      port: 8500,
    });

    await close(app);
  });

  it('should create custom clients and keep factory/service injection', async () => {
    const app = await createLightApp({
      imports: [consul],
      globalConfig: {
        consul: {
          clients: {
            default: {
              customClientClass: CustomConsul,
              host: 'default.local',
              port: 8500,
            },
            backup: {
              customClientClass: CustomConsul,
              host: 'backup.local',
              port: 8500,
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(consul.ConsulServiceFactory);
    const service = await app
      .getApplicationContext()
      .getAsync(consul.ConsulService);
    const defaultClient = factory.get<CustomConsul>();
    const backupClient = factory.get<CustomConsul>('backup');

    expect(defaultClient).toBeInstanceOf(CustomConsul);
    expect(backupClient).toBeInstanceOf(CustomConsul);
    expect(defaultClient.config.customClientClass).toBeUndefined();
    expect(backupClient.config.host).toBe('backup.local');
    expect((service as any).instance).toBe(defaultClient);

    await close(app);
  });

  it('should bind trace context to custom client', async () => {
    const factory = new consul.ConsulServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = { runWithExitSpan };

    const client: any = await factory.createClient(
      {
        customClientClass: CustomConsul,
        host: 'localhost',
        port: 8500,
      } as any,
      'default'
    );

    expect(await client.request({ method: 'GET' })).toBe('GET');
    expect(runWithExitSpan).toHaveBeenCalledTimes(1);
  });
});
