import { createApp, createHttpRequest, close } from '@midwayjs/mock';
import { IMidwayApplication, sleep } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test read from redis', async () => {
    const app = await createApp('base-app') as IMidwayApplication;
    const response = await createHttpRequest(app).get('/?username=bob');
    expect(response.status).toEqual(403);

    const response1 = await createHttpRequest(app).get('/?username=tom');
    expect(response1.status).toEqual(200);

    const response2 = await createHttpRequest(app).get('/?username=zhangting');
    expect(response2.status).toEqual(403);

    // 动态添加一个策略
    await createHttpRequest(app).get('/add');

    await sleep(2000);

    // 等 redis 同步
    const response3 = await createHttpRequest(app).get('/?username=zhangting');
    expect(response3.status).toEqual(200);

    await close(app);
  });
});
