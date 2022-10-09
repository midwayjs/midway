import { createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test read from typeorm', async () => {
    const app = await createApp('base-app') as IMidwayApplication;
    const response = await createHttpRequest(app).get('/?username=bob');
    expect(response.status).toEqual(403);

    const response1 = await createHttpRequest(app).get('/?username=tom');
    expect(response1.status).toEqual(200);
  });
});
