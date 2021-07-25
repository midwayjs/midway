import { LightFramework } from '@midwayjs/core';
import { HttpService } from '../src';

describe('/test/index.test.ts', () => {

  let httpService;
  let container;
  let framework;

  beforeAll(async () => {
    framework = new LightFramework();
    framework.configure();
    await framework.initialize({ baseDir: process.cwd() });
    container = framework.getApplicationContext();
    httpService = await container.getAsync(HttpService);
  });

  it('should test http service singleton', async () => {
    expect(httpService).toBeDefined();
    const httpService2 = await container.getAsync(HttpService);
    expect(httpService).toEqual(httpService2);
  });

  it('should test context http service', async () => {
    const ctx = framework.getApplication().createAnonymousContext();
    const httpServiceWithRequest = await ctx.requestContext.getAsync(HttpService);
    expect(httpServiceWithRequest).toBeDefined();
    expect(httpServiceWithRequest).not.toEqual(httpService);
  });
});
