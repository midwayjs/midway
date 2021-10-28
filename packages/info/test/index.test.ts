import { close, createLightApp } from '@midwayjs/mock';
import { InfoService } from '../src';
import { join } from 'path';
describe('test/index.test.ts', () => {

  // it('info service', async () => {
  //   const starter = await create('base-app');
  //   const data = await starter.handleInvokeWrapper('index.handler')(
  //     {
  //       text: 'hello',
  //     },
  //     { text: 'a' }
  //   );
  //   expect(data).toEqual('ahello');
  // });
  it('info service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/app'));
    const infoService = await app.getApplicationContext().getAsync(InfoService);
    console.log(infoService);
    expect(infoService).toBeDefined();
    await close(app);
  });
});