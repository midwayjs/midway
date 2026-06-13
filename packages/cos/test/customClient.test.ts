import { close, createLightApp } from '@midwayjs/mock';
import * as cos from '../src';

describe('/test/customClient.test.ts', () => {
  class CustomCOS {
    constructor(public config: any) {}

    request(options: any) {
      return Promise.resolve(options.Action);
    }
  }

  it('should create a custom client from client config', async () => {
    const app = await createLightApp('', {
      imports: [cos],
      globalConfig: {
        cos: {
          client: {
            customClientClass: CustomCOS,
            SecretId: 'default-id',
            SecretKey: 'secret',
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(cos.COSServiceFactory);

    expect(factory.get()).toBeInstanceOf(CustomCOS);

    await close(app);
  });

  it('should create custom clients and keep factory/service injection', async () => {
    const app = await createLightApp('', {
      imports: [cos],
      globalConfig: {
        cos: {
          clients: {
            default: {
              customClientClass: CustomCOS,
              SecretId: 'default-id',
              SecretKey: 'secret',
            },
            backup: {
              customClientClass: CustomCOS,
              SecretId: 'backup-id',
              SecretKey: 'secret',
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(cos.COSServiceFactory);
    const service = await app.getApplicationContext().getAsync(cos.COSService);
    const defaultClient = factory.get<CustomCOS>();
    const backupClient = factory.get<CustomCOS>('backup');

    expect(defaultClient).toBeInstanceOf(CustomCOS);
    expect(backupClient).toBeInstanceOf(CustomCOS);
    expect(defaultClient.config.customClientClass).toBeUndefined();
    expect(backupClient.config.SecretId).toBe('backup-id');
    expect((service as any).instance).toBe(defaultClient);

    await close(app);
  });

  it('should bind trace context to custom client', async () => {
    const factory = new cos.COSServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = { runWithExitSpan };

    const client: any = await factory.createClient({
      customClientClass: CustomCOS,
      SecretId: 'test',
      SecretKey: 'secret',
    } as any);

    expect(await client.request({ Action: 'GetObject' })).toBe('GetObject');
    expect(runWithExitSpan).toHaveBeenCalledTimes(1);
  });
});
