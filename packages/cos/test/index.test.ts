import { join } from 'path';
import { COSService } from '../src';
import { close, createLightApp } from '@midwayjs/mock';

if (process.env.GITHUB_JOB && !process.env.TENCENT_COS_SECRET_ID) {
  // pr 环境
  describe('/test/index.test.ts', () => {
    it('should skip pr', function () {
      console.log('skip in pr');
    });
  });
  // @ts-ignore
  return;
}

describe('/test/index.test.ts', () => {

  it('test single client', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-single-client'));
    const cosService = await app.getApplicationContext().getAsync(COSService);
    expect(cosService).toBeDefined();
    await close(app);
  });
});
