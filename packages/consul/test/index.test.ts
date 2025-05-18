import { close, createLightApp } from '@midwayjs/mock';
import * as consul from '../src';

describe('/test/feature.test.ts', () => {
  it('should create consul instance', async () => {
    const app = await createLightApp({
      imports: [
        consul
      ],
      globalConfig: {
        consul: {
          client: {
            host: 'localhost',
            port: 8500
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
