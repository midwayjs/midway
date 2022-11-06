import * as etcd from '../src';
import { close, createLightApp } from '@midwayjs/mock';
import { ETCDService } from '../src';

describe('/test/index.test.ts', () => {

  it('test single client', async () => {
    const app = await createLightApp('', {
      imports: [etcd],
      globalConfig: {
        etcd: {
          client: {
            hosts: ['127.0.0.1:2379'],
          }
        }
      }
    });
    const etcdService = await app.getApplicationContext().getAsync(etcd.ETCDService);
    expect(etcdService).toBeDefined();

    await etcdService.put('foo').value('bar');

    const fooValue = await etcdService.get('foo').string();
    console.log('foo was:', fooValue);

    const allFValues = await etcdService.getAll().prefix('f').keys();
    console.log('all our keys starting with "f":', allFValues);

    await etcdService.delete().all();
    await close(app);
  });

  it('should throw error when instance not found', async () => {
    await expect(async () => {
      const service = new ETCDService();
      (service as any).serviceFactory = new Map();
      await service.init();
    }).rejects.toThrowError(/instance not found/);
  });
});
