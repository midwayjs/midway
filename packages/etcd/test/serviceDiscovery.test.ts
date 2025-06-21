import { close, createLightApp } from '@midwayjs/mock';
import * as etcd from '../src';
import { sleep } from '@midwayjs/core';
import { Etcd3 } from 'etcd3';

describe('/test/serviceDiscovery.test.ts', () => {
  const fix_service_name = 'test-service';
  beforeEach(async () => {
    const client = new Etcd3({ hosts: '127.0.0.1:2379' });
    await client.delete().key(`services/${fix_service_name}/`);
  });

  it('should test service discovery', async () => {
    const app = await createLightApp({
      imports: [
        etcd,
      ],
      globalConfig: {
        etcd: {
          client: {
            hosts: ['127.0.0.1:2379'],
          },
        },
      },
    });

    await sleep(1000);

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    expect(etcdServiceDiscovery).toBeDefined();

    const client = etcdServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
      ttl: 6000,
    });

    await sleep(1000);

    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();

    // test deregister
    await client.deregister();
    await sleep(1000);
    const instances1 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await close(app);
  });

  it('should test with online and offline', async () => {
    const app = await createLightApp({
      imports: [
        etcd,
      ],
      globalConfig: {
        etcd: {
          client: {
            hosts: ['127.0.0.1:2379'],
          },
        },
      },
    });

    await sleep(1000);

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    const client = etcdServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
    });

    await sleep(1000);

    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();

    await client.offline();
    await sleep(1000);
    const instances1 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await client.online();
    await sleep(1000);
    const instances2 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances2)).toBeTruthy();

    await client.deregister();
    await sleep(1000);
    const instances3 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances3.length).toEqual(0);

    await close(app);
  });

  it('should test multi online and offline', async () => {
    const app = await createLightApp({
      imports: [
        etcd,
      ],
      globalConfig: {
        etcd: {
          client: {
            hosts: ['127.0.0.1:2379'],
          },
        },
      },
    });

    await sleep(1000);

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    const client = etcdServiceDiscovery.createClient();
    await client.register({
      id: client.defaultMeta.id,
      serviceName: fix_service_name,
      ttl: 600,
    });

    await client.online();
    await client.online();

    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();

    await client.offline();
    await client.offline();

    const instances1 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await close(app);
  });

  it('should keep state correct for multiple register/online/offline/deregister', async () => {
    const app = await createLightApp({
      imports: [etcd],
      globalConfig: {
        etcd: {
          client: {
            hosts: ['127.0.0.1:2379'],
          },
        },
      },
    });

    await sleep(1000);

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    const client = etcdServiceDiscovery.createClient();
    const meta = {
      id: client.defaultMeta.id,
      serviceName: 'test-state-service',
      ttl: 600,
    };

    // 多次 register 只会生效一次
    await client.register(meta);
    await client.register(meta);
    await client.register(meta);
    await sleep(500);
    let instances = await etcdServiceDiscovery.getInstances(meta.serviceName);
    expect(Array.isArray(instances)).toBeTruthy();

    // 多次 online 只会生效一次
    await client.online();
    await client.online();
    await client.online();
    await sleep(500);
    instances = await etcdServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toBe(1);

    // 多次 offline 只会生效一次
    await client.offline();
    await client.offline();
    await client.offline();
    await sleep(500);
    instances = await etcdServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toBe(0);

    // offline 后还能 online
    await client.online();
    await sleep(500);
    instances = await etcdServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toBe(1);

    // 多次 deregister 只会生效一次
    await client.deregister();
    await client.deregister();
    await client.deregister();
    await sleep(500);
    instances = await etcdServiceDiscovery.getInstances(meta.serviceName);
    expect(instances.length).toBe(0);

    await close(app);
  });
});
