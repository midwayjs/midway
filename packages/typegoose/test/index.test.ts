import { close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should connect mongodb', async () => {
    let app = await createLightApp(join(__dirname, 'fixtures', 'base-app'), {});
    await close(app);
  });

  it('should connect mongodb with new decorator', async () => {
    let app = await createLightApp(join(__dirname, 'fixtures', 'base-app-decorator'), {});
    await close(app);
  });
});
