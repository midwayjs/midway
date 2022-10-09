import { createApp, createHttpRequest } from '@midwayjs/mock';
import { CasbinEnforcerService } from '../src';
import { IMidwayApplication } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test casbin api', async () => {
    const app = await createApp('base-app') as IMidwayApplication;
    const enforcerService = await app.getApplicationContext().getAsync<CasbinEnforcerService>(CasbinEnforcerService);
    const policy = await enforcerService.getPolicy();
    expect(policy).toMatchSnapshot();
  });

  it('should test decorator', async () => {
    const app = await createApp('base-app-decorator') as IMidwayApplication;
    const response = await createHttpRequest(app).get('/?username=bob');
    expect(response.status).toEqual(403);

    const response1 = await createHttpRequest(app).get('/?username=tom');
    expect(response1.status).toEqual(200);
  });
});
