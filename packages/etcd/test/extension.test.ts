import { close, createLightApp } from "@midwayjs/mock";
import * as etcd from '../src';

describe('etcd extension', () => {
  it('should work', async () => {
    const app = await createLightApp({
      imports: [
        etcd,
      ]
    });
    const etcdServiceDiscovery = await app.getApplicationContext().getAsync(etcd.EtcdServiceDiscovery);

    etcdServiceDiscovery.register();

    const serviceDiscovery = etcdServiceDiscovery.get();

    // await serviceDiscovery.init();

    const instances = await serviceDiscovery.getInstances('test');
    console.log(instances);

    await etcdServiceDiscovery.init({
      endpoints: ['http://127.0.0.1:2379'],
    });

    await close(app);
  });
});
