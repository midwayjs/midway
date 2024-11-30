import { createApp, createHttpRequest, close } from '@midwayjs/mock';

describe('index.test.ts', () => {
  it('should work with koa and nextjs page router', async () => {
    const app = await createApp('base-app');
    const result = await createHttpRequest(app).get('/');
    expect(result.headers['content-type']).toMatch(/text\/html/);
    expect(result.text).toMatch(/Hello World/);
    expect(result.status).toBe(200);

    await close(app);
  });
});
