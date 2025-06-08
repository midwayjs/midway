import { close, createLightApp } from '@midwayjs/mock';
import * as redis from '../src';
import { sleep } from '@midwayjs/core';

describe('/test/serviceDiscovery.test.ts', () => {

  beforeAll(async () => {
    // use redis client to flushall
    const client = new redis.Redis({
      host: '127.0.0.1',
      port: 6379,
    });
    await client.flushall();
    await client.quit();
  });

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
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);
    expect(redisServiceDiscovery).toBeDefined();

    const client = redisServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
      host: client.defaultMeta.host,
      port: client.defaultMeta.port,
      ttl: 600,
    });

    await sleep(1000);

    const instances = await redisServiceDiscovery.getInstances(fix_service_name);

    expect(instances.length).toEqual(1);

    // test deregister
    await client.deregister();

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
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);

    const client = redisServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
      host: client.defaultMeta.host,
      port: client.defaultMeta.port,
    })

    await sleep(1000);

    const instances = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances.length).toEqual(1);

    await client.offline();
    await sleep(1000);

    const instances1 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await client.online();
    await sleep(1000);

    const instances2 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances2.length).toEqual(1);

    await client.deregister();
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
        },
      },
    });

    await sleep(1000);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);

    const client = redisServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
      host: client.defaultMeta.host,
      port: client.defaultMeta.port,
      ttl: 600,
    });

    await client.online();
    await client.online();

    await sleep(1000);

    const instances = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances.length).toEqual(1);

    await client.offline();
    await client.offline();

    await sleep(1000);

    const instances1 = await redisServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await client.deregister();
    await close(app);
  });

  it('should keep state correct for multiple register/online/offline/deregister', async () => {
    const app = await createLightApp({
      imports: [redis],
      globalConfig: {
        redis: {
          clients: {
            default: {
              port: 6379,
              host: '127.0.0.1',
            },
          },
        },
      },
    });

    await sleep(500);

    const redisServiceDiscovery = await app.getApplicationContext().getAsync(redis.RedisServiceDiscovery);
    const client = redisServiceDiscovery.createClient();
    const meta = {
      id: client.defaultMeta.id,
      serviceName: 'test-state-service',
      host: client.defaultMeta.host,
      port: client.defaultMeta.port,
      ttl: 600,
    };

    // 多次 register 只会生效一次
    await client.register(meta);
    await client.register(meta);
    await client.register(meta);

    await sleep(500);

    let instances = await redisServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toEqual(1);

    // 多次 online 只会生效一次
    await client.online();
    await client.online();
    await client.online();

    await sleep(500);

    instances = await redisServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toEqual(1);

    // 多次 offline 只会生效一次
    await client.offline();
    await client.offline();
    await client.offline();

    await sleep(500);

    instances = await redisServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toEqual(0);

    // offline 后还能 online
    await client.online();
    await sleep(500);
    instances = await redisServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toEqual(1);

    // 多次 deregister 只会生效一次
    await client.deregister();
    await client.deregister();
    await client.deregister();

    await sleep(500);

    instances = await redisServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toEqual(0);

    await close(app);
  });
});
