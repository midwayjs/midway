import { close, createLegacyLightApp } from '@midwayjs/mock';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should connect mongodb with new decorator', async () => {
    let app = await createLegacyLightApp(join(__dirname, 'fixtures', 'base-app-decorator'));
    await close(app);
  });
});
