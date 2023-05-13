import { createApp, createHttpRequest } from '@midwayjs/mock';

describe('test/helper.test.ts', () => {
  it('should test helper', async () => {
    const app = await createApp('helper');
    const htmlResult = await createHttpRequest(app).get('/html');
    expect(htmlResult.text).toEqual('&lt;script&gt;alert(1)&lt;/script&gt;');

    const escapeResult = await createHttpRequest(app).get('/escape');
    expect(escapeResult.text).toEqual('foo &amp; bar');
  });
});
