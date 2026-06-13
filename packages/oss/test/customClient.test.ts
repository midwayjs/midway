import { close, createLightApp } from '@midwayjs/mock';
import * as oss from '../src';

describe('/test/customClient.test.ts', () => {
  class CustomOSS {
    constructor(public config: any) {}

    request(options: any) {
      return Promise.resolve(options.method);
    }
  }

  it('should create a custom client from client config', async () => {
    const app = await createLightApp('', {
      imports: [oss],
      globalConfig: {
        oss: {
          client: {
            customClientClass: CustomOSS,
            accessKeyId: 'default-id',
            accessKeySecret: 'secret',
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(oss.OSSServiceFactory);

    expect(factory.get()).toBeInstanceOf(CustomOSS);

    await close(app);
  });

  it('should create custom clients and keep factory/service injection', async () => {
    const app = await createLightApp('', {
      imports: [oss],
      globalConfig: {
        oss: {
          clients: {
            default: {
              customClientClass: CustomOSS,
              accessKeyId: 'default-id',
              accessKeySecret: 'secret',
            },
            backup: {
              customClientClass: CustomOSS,
              accessKeyId: 'backup-id',
              accessKeySecret: 'secret',
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(oss.OSSServiceFactory);
    const service = await app.getApplicationContext().getAsync(oss.OSSService);
    const defaultClient = factory.get<CustomOSS>();
    const backupClient = factory.get<CustomOSS>('backup');

    expect(defaultClient).toBeInstanceOf(CustomOSS);
    expect(backupClient).toBeInstanceOf(CustomOSS);
    expect(defaultClient.config.customClientClass).toBeUndefined();
    expect(backupClient.config.accessKeyId).toBe('backup-id');
    expect((service as any).instance).toBe(defaultClient);

    await close(app);
  });

  it('should bind trace context to custom client', async () => {
    const factory = new oss.OSSServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = { runWithExitSpan };

    const client: any = await factory.createClient({
      customClientClass: CustomOSS,
      accessKeyId: 'test',
      accessKeySecret: 'secret',
    } as any);

    expect(await client.request({ method: 'PUT' })).toBe('PUT');
    expect(runWithExitSpan).toHaveBeenCalledTimes(1);
  });
});
