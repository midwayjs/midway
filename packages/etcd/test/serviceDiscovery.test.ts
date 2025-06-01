import { close, createLightApp } from '@midwayjs/mock';
import * as etcd from '../src';
import { DefaultInstanceMetadata, sleep } from '@midwayjs/core';

describe('/test/serviceDiscovery.test.ts', () => {
  const fix_service_name = 'test-service';
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
          serviceDiscovery: {
            selfRegister: true,
            serviceOptions: (meta: DefaultInstanceMetadata) => {
              return {
                id: meta.id,
                serviceName: fix_service_name,
                host: meta.host,
                port: meta.port,
                ttl: 6000,
              };
            }
          }
        },
      },
    });

    await sleep(1000);

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    expect(etcdServiceDiscovery).toBeDefined();

    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();
    // etcd 可能没有自动注册，长度不一定为 1

    // test deregister
    await etcdServiceDiscovery.deregister();
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

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);
    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();

    await etcdServiceDiscovery.offline();
    await sleep(1000);
    const instances1 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await etcdServiceDiscovery.online();
    await sleep(1000);
    const instances2 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances2)).toBeTruthy();

    await etcdServiceDiscovery.deregister();
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

    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);

    await etcdServiceDiscovery.online();
    await etcdServiceDiscovery.online();

    const instances = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(Array.isArray(instances)).toBeTruthy();

    await etcdServiceDiscovery.offline();
    await etcdServiceDiscovery.offline();

    const instances1 = await etcdServiceDiscovery.getInstances(fix_service_name);
    expect(instances1.length).toEqual(0);

    await close(app);
  });
});
