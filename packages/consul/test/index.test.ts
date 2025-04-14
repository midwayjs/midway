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
  });

});
