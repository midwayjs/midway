import { createApp, createHttpRequest, close } from '@midwayjs/mock';
import * as Configuration from '../src/index';

describe('index.test.ts', () => {
  it('should work with koa and nextjs page router', async () => {
    const app = await createApp({
      imports: [Configuration],
    });
    const result = await createHttpRequest(app).get('/');
    console.log(result.headers['content-type']);
    expect(result.text).toMatch(/Hello World/);
    expect(result.status).toBe(200);

    await close(app);
  });
});
