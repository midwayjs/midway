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
                    ttl: '30s',
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
  });

});
