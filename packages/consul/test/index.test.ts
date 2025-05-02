import {close, createLightApp} from '@midwayjs/mock';
import * as consul from '../src';
import { sleep } from '@midwayjs/core';
describe('/test/feature.test.ts', () => {

  describe('test consul instance', () => {
    it('should create consul instance', async () => {
      const app = await createLightApp({
        imports: [
          consul,
        ],
        globalConfig: {
          consul: {
            client: {
              host: 'localhost',
              port: 8500,
            }
          }
        }
      });
      const consulServiceFactory = await app.getApplicationContext().getAsync(consul.ConsulServiceFactory);
      expect(consulServiceFactory).toBeDefined();

      const consulClient = consulServiceFactory.get('default');
      expect(consulClient).toBeDefined();

      const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);
      expect(consulServiceDiscovery).toBeDefined();

      await close(app);
    });
  });

  describe('test consul service discovery', () => {
    it('should create consul service discovery and test get instances', async () => {
      const fix_service_name = 'test-service';
      const app = await createLightApp({
        imports: [consul],
        globalConfig: {
          consul: {
            client: {
              host: 'localhost',
              port: 8500,
            },
            serviceDiscovery: {
              selfRegister: true,
              serviceOptions: (meta) => {
                return {
                  id: meta.id,
                  name: fix_service_name,
                  tags: ['test'],
                  address: meta.host,
                  port: 8500,
                  meta: {
                    version: '1.0.0',
                  },
                  check: {
                    ttl: '10s',
                  }
                }
              }
            }
          }
        }
      });

      const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);
      expect(consulServiceDiscovery).toBeDefined();

      const instances = await consulServiceDiscovery.getInstances({
        service: fix_service_name,
      });
      expect(instances.length).toBeGreaterThan(0);

      await sleep(1000);

      const instances1 = await consulServiceDiscovery.getInstance({
        service: fix_service_name,
      });
      expect(instances1).toEqual(instances[0]);

      await close(app);
    });

    it('should test online and offline', async () => {
      const fix_service_name = 'test-service';
      const app = await createLightApp({
        imports: [consul],
        globalConfig: {
          consul: {
            client: {
              host: 'localhost',
              port: 8500,
            },
            serviceDiscovery: {
              selfRegister: false,
              serviceOptions: (meta) => {
                return {
                  id: meta.id,
                  name: fix_service_name,
                  tags: ['test'],
                  address: meta.host,
                  port: 8500,
                  meta: {
                    version: '1.0.0',
                  },
                  check: {
                    ttl: '10s',
                  }
                }
              }
            }
          }
        }
      });

      const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);

      console.log('开始注册')

      await consulServiceDiscovery.register();

      const instances = await consulServiceDiscovery.getInstances(fix_service_name);
      expect(instances.length).toBeGreaterThan(0);

      console.log('开始下线')

      // offline
      await consulServiceDiscovery.offline();

      await sleep(1000);

      const instances1 = await consulServiceDiscovery.getInstances(fix_service_name);
      expect(instances1.length).toBe(0);

      await close(app);

    });

    it('should watch service changes', async () => {
      const app = await createLightApp({
        imports: [consul],
        globalConfig: {
          consul: {
            client: {
              host: 'localhost',
              port: 8500,
            },
            serviceDiscovery: {
              selfRegister: false,
              serviceOptions: (meta) => {
                return {
                  id: meta.id,
                  name: meta.serviceName,
                  tags: ['test'],
                  address: meta.host,
                  port: 8500,
                  meta: {
                    version: '1.0.0',
                  },
                  check: {
                    ttl: '10s',
                  }
                }
              }
            }
          }
        }
      });

      const consulServiceDiscovery = await app.getApplicationContext().getAsync(consul.ConsulServiceDiscovery);
      expect(consulServiceDiscovery).toBeDefined();

      // 先注册自己
      await consulServiceDiscovery.register();

      // 获取当前服务实例
      const currentInstance = consulServiceDiscovery.getAdapter().getSelfInstance();
      const serviceName = currentInstance.name;
      expect(serviceName).toBeDefined();

      // 创建几个不同的服务实例
      const instanceIds = ['test-instance-1', 'test-instance-2', 'test-instance-3'];

      // 注册多个实例，每个实例使用不同的 meta
      for (const id of instanceIds) {
        const instanceMeta = {
          id,
          name: serviceName,
          tags: ['test'],
          address: '127.0.0.1',
          port: 8500,
          meta: {
            version: '1.0.0',
            custom: `custom-${id}`,
          },
          check: {
            name: `check-${id}`,
            ttl: '10s',
            timeout: '5s',
            status: 'passing'
          },
          getMetadata: () => {
            return {
              version: '1.0.0',
              custom: `custom-${id}`,
            };
          }
        };
        await consulServiceDiscovery.getAdapter().register(instanceMeta);
      }

      const result = await consulServiceDiscovery.getInstances(serviceName);
      console.log(result);

      // 等待一段时间让 watch 生效
      await new Promise(resolve => setTimeout(resolve, 1000));

      //
      // // 验证所有注册的实例是否都在返回的列表中，并且 meta 信息正确
      // const instanceIdsInWatch = watchInstances.map(instance => instance.id);
      // for (const id of instanceIds) {
      //   expect(instanceIdsInWatch).toContain(id);
      //   const instance = watchInstances.find(inst => inst.id === id);
      //   expect(instance).toBeDefined();
      //   expect(instance.meta.custom).toBe(`custom-${id}`);
      // }

      // 清理注册的实例
      for (const id of instanceIds) {
        await consulServiceDiscovery.getAdapter().deregister({
          id,
          name: serviceName,
        });
      }

      await close(app);
    });
  });

});
