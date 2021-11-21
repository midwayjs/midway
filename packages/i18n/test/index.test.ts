import { close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';

describe('test/index.test.ts', () => {
  it('i18n service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/app'));
    await close(app);
  });
});
