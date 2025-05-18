import { close, createLightApp } from '@midwayjs/mock';
import * as redis from '../src';
import { DefaultInstanceMetadata, sleep } from '@midwayjs/core';

describe('/test/serviceDiscovery.test.ts', () => {
  const fix_service_name = 'test-service';
  it('should test service discovery', async () => {
    const app = await createLightApp({
      imports: [
        redis,
      ],
      globalConfig: {
        redis: {
          clients: {
            default: {
              port: 6379,
              host: '127.0.0.1',
            },
          },
          serviceDiscovery: {
            selfRegister: true,
            serviceOptions: (meta: DefaultInstanceMetadata) => {
              return {
                id: meta.id,
                serviceName: fix_service_name,
                host: meta.host,
                port: meta.port,
                ttl: 600,
              };
            }
          }
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);
    expect(redisServiceDiscovery).toBeDefined();

    const instances = await redisServiceDiscovery.getInstances(fix_service_name);

    expect(instances.length).toEqual(1);

    // test deregister
    await redisServiceDiscovery.deregister();

    await sleep(1000);

    const instances1 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await close(app);
  });

  it('should test with online and offline', async () => {
    const app = await createLightApp({
      imports: [
        redis,
      ],
      globalConfig: {
        redis: {
          clients: {
            default: {
              port: 6379,
              host: '127.0.0.1',
            },
          },
          serviceDiscovery: {
            selfRegister: true,
            serviceOptions: (meta: DefaultInstanceMetadata) => {
              return {
                id: meta.id,
                serviceName: fix_service_name,
                host: meta.host,
                port: meta.port,
              };
            }
          }
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);
    const instances = await redisServiceDiscovery.getInstances(fix_service_name);

    expect(instances.length).toEqual(1);

    await redisServiceDiscovery.offline();
    await sleep(1000);

    const instances1 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await redisServiceDiscovery.online();
    await sleep(1000);

    const instances2 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances2.length).toEqual(1);

    await redisServiceDiscovery.deregister();
    await sleep(1000);

    const instances3 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances3.length).toEqual(0);

    await close(app);
  });

  it('should test multi online and offline', async () => {
    const app = await createLightApp({
      imports: [
        redis,
      ],
      globalConfig: {
        redis: {
          clients: {
            default: {
              port: 6379,
              host: '127.0.0.1',
            },
          },
          serviceDiscovery: {
            selfRegister: true,
            serviceOptions: (meta: DefaultInstanceMetadata) => {
              return {
                id: meta.id,
                serviceName: fix_service_name,
                host: meta.host,
                port: meta.port,
                ttl: 600,
              };
            }
          }
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);

    await redisServiceDiscovery.online();
    await redisServiceDiscovery.online();

    const instances = await redisServiceDiscovery.getInstances(fix_service_name);

    expect(instances.length).toEqual(1);

    await redisServiceDiscovery.offline();
    await redisServiceDiscovery.offline();

    const instances1 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await close(app);
  });
});
