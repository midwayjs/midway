import { close, createLightApp } from '@midwayjs/mock';
import * as etcd from '../src';

describe('/test/customClient.test.ts', () => {
  class CustomEtcd3 {
    public pool = {
      exec: jest.fn(async (_service, method) => method),
    };

    constructor(public config: any) {}

    async close() {}
  }

  it('should create a custom client from client config', async () => {
    const app = await createLightApp('', {
      imports: [etcd],
      globalConfig: {
        etcd: {
          client: {
            customClientClass: CustomEtcd3,
            hosts: ['default.local:2379'],
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(etcd.ETCDServiceFactory);

    expect(factory.get()).toBeInstanceOf(CustomEtcd3);

    await close(app);
  });

  it('should create custom clients and keep factory/service injection', async () => {
    const app = await createLightApp('', {
      imports: [etcd],
      globalConfig: {
        etcd: {
          clients: {
            default: {
              customClientClass: CustomEtcd3,
              hosts: ['default.local:2379'],
            },
            backup: {
              customClientClass: CustomEtcd3,
              hosts: ['backup.local:2379'],
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(etcd.ETCDServiceFactory);
    const service = await app.getApplicationContext().getAsync(etcd.ETCDService);
    const defaultClient = factory.get<CustomEtcd3>();
    const backupClient = factory.get<CustomEtcd3>('backup');

    expect(defaultClient).toBeInstanceOf(CustomEtcd3);
    expect(backupClient).toBeInstanceOf(CustomEtcd3);
    expect(defaultClient.config.customClientClass).toBeUndefined();
    expect(backupClient.config.hosts).toEqual(['backup.local:2379']);
    expect((service as any).instance).toBe(defaultClient);

    await close(app);
  });

  it('should bind trace context to custom client', async () => {
    const factory = new etcd.ETCDServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = { runWithExitSpan };

    const client: any = await factory.createClient({
      customClientClass: CustomEtcd3,
      hosts: ['localhost:2379'],
    } as any);

    expect(await client.pool.exec('KV', 'put', {})).toBe('put');
    expect(runWithExitSpan).toHaveBeenCalledTimes(1);
  });
});
