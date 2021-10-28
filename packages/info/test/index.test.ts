import { close, createLightApp } from '@midwayjs/mock';
import { InfoService, InfoValueType } from '../src';
import * as assert from 'assert';
import { join } from 'path';
describe('test/index.test.ts', () => {
  it('info service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/app'));
    const infoService = await app.getApplicationContext().getAsync(InfoService);
    expect(infoService).toBeDefined();
    const info = infoService.info();
    assert(info.length);

    const html = infoService.info(InfoValueType.HTML);
    console.log('html', html);
    assert(html);
    await close(app);
  });
});