import { close, createLightApp } from '@midwayjs/mock';
import * as redis from '../src';
import { sleep } from '@midwayjs/core';

// 辅助函数
async function waitForInstance(redisServiceDiscovery, serviceName, expected = 1, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const instances = await redisServiceDiscovery.getInstances(serviceName);
    if (instances.length === expected) {
      console.log(`[waitForInstance] waited ${(Date.now() - start)}ms for ${expected} instance(s)`);
      return instances;
    }
    await sleep(100);
  }
  throw new Error('Instance not found within timeout');
}

describe('/test/serviceDiscovery.test.ts', () => {

  beforeEach(async () => {
    const client = new redis.Redis({ host: '127.0.0.1', port: 6379 });
    const keys = await client.keys('services:test-service*');
    if (keys.length) await client.del(keys);
    await client.quit();
  });

  it('should test service discovery', async () => {
    const fix_service_name = 'test-service-' + Date.now() + '-' + Math.random();
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
      ttl: 30,
    });

    const instances = await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);
    expect(instances.length).toEqual(1);

    // test deregister
    await client.deregister();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    await close(app);
  });

  it('should test with online and offline', async () => {
    const fix_service_name = 'test-service-' + Date.now() + '-' + Math.random();
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

    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    await client.offline();
    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    await client.online();
    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    await client.deregister();
    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    await close(app);
  });

  it('should test multi online and offline', async () => {
    const fix_service_name = 'test-service-' + Date.now() + '-' + Math.random();
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
      ttl: 30,
    });

    await client.online();
    await client.online();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    await client.offline();
    await client.offline();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    await client.deregister();
    await close(app);
  });

  it('should keep state correct for multiple register/online/offline/deregister', async () => {
    const fix_service_name = 'test-state-service-' + Date.now() + '-' + Math.random();
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
      serviceName: fix_service_name,
      host: client.defaultMeta.host,
      port: client.defaultMeta.port,
      ttl: 30,
    };

    // 多次 register 只会生效一次
    await client.register(meta);
    await client.register(meta);
    await client.register(meta);

    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    // 多次 online 只会生效一次
    await client.online();
    await client.online();
    await client.online();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    // 多次 offline 只会生效一次
    await client.offline();
    await client.offline();
    await client.offline();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    // offline 后还能 online
    await client.online();
    await waitForInstance(redisServiceDiscovery, fix_service_name, 1, 5000);

    // 多次 deregister 只会生效一次
    await client.deregister();
    await client.deregister();
    await client.deregister();

    await waitForInstance(redisServiceDiscovery, fix_service_name, 0, 5000);

    await close(app);
  });
});
