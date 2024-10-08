import { createApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

describe('test/helper.test.ts', () => {
  it('should test helper', async () => {
    const appDir = join(__dirname, `fixtures/helper`);
    const app = await createApp(appDir);
    const htmlResult = await createHttpRequest(app).get('/html');
    expect(htmlResult.text).toEqual('&lt;script&gt;alert(1)&lt;/script&gt;');

    const escapeResult = await createHttpRequest(app).get('/escape');
    expect(escapeResult.text).toEqual('foo &amp; bar');
  });
});
