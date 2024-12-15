import { createLegacyApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should test read from typeorm', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/base-app')) as IMidwayApplication;
    const response = await createHttpRequest(app).get('/?username=bob');
    expect(response.status).toEqual(403);

    const response1 = await createHttpRequest(app).get('/?username=tom');
    expect(response1.status).toEqual(200);
  });
});
