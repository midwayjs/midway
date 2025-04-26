import {close, createLightApp} from '@midwayjs/mock';
import * as consul from '../src';
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
    it('should create consul service discovery', async () => {
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

      const serviceNames = await consulServiceDiscovery.getServiceNames();
      expect(serviceNames).toBeDefined();
      expect(serviceNames.length).toBeGreaterThan(0);

      const instances = await consulServiceDiscovery.getInstances(serviceNames[1]);
      expect(instances.length).toBeGreaterThan(0);

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
      const currentInstance = consulServiceDiscovery.getAdapter().getCurrentServiceInstance();
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

      // 等待一段时间让 watch 生效
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await consulServiceDiscovery.getInstances(serviceName);
      console.log(result);

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
          getMetadata: () => {
            return {
              version: '1.0.0',
              custom: `custom-${id}`,
            };
          }
        });
      }

      await close(app);
    });
  });

});
