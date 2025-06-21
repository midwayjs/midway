import { close, createLightApp } from '@midwayjs/mock';
import * as consul from '../src';
import { sleep } from '@midwayjs/core';

describe('test consul service discovery', () => {
  const fix_service_name = 'test-service';

  it('should create consul service discovery and test get instances', async () => {

    const app = await createLightApp({
      imports: [consul],
      globalConfig: {
        consul: {
          client: {
            host: 'localhost',
            port: 8500
          },
        }
      }
    });

    const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);
    expect(consulServiceDiscovery).toBeDefined();

    const client = consulServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      name: fix_service_name,
      tags: ['test'],
      address: client.defaultMeta.host,
      port: 8500,
      meta: {
        version: '1.0.0'
      },
      check: {
        name: 'TTL Health Check',
        timeout: '30s',
        ttl: '10s'
      }
    });

    await sleep(1000);

    const instances = await consulServiceDiscovery.getInstances({
      service: fix_service_name,
    });
    expect(instances.length).toBeGreaterThan(0);

    await sleep(1000);

    const instances1 = await consulServiceDiscovery.getInstance({
      service: fix_service_name
    });
    expect(instances1).toEqual(instances[0]);

    await close(app);
  });

  it('should test online and offline', async () => {
    const app = await createLightApp({
      imports: [consul],
      globalConfig: {
        consul: {
          client: {
            host: 'localhost',
            port: 8500
          },
        }
      }
    });

    const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);

    console.log('开始注册');
    const client1 = consulServiceDiscovery.createClient();

    await client1.register({
      id: client1.defaultMeta.id,
      name: fix_service_name,
      tags: ['test'],
      address: client1.defaultMeta.host,
      port: 8500,
      meta: {
        version: '1.0.0'
      },
      check: {
        name: 'TTL Health Check',
        timeout: '30s',
        ttl: '10s'
      }
    });

    const instances = await consulServiceDiscovery.getInstances({
      service: fix_service_name
    });
    expect(instances.length).toBeGreaterThan(0);

    console.log('开始下线');

    // offline
    await client1.offline();

    await sleep(1000);

    const instances1 = await consulServiceDiscovery.getInstances({
      service: fix_service_name
    });
    expect(instances1.length).toBe(0);

    await close(app);

  });
});
