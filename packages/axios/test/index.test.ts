import { LightFramework } from '@midwayjs/core';
import { join } from 'path';
import { HttpService } from '../src';

describe('/test/index.test.ts', () => {

  let httpService: any;
  let container;
  let framework;

  beforeAll(async () => {
    framework = new LightFramework();
    framework.configure();
    await framework.initialize({ baseDir: join(__dirname, './fixtures/base-app/src') });
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

  it('should test proxy method', function () {
    const proxyMethods = [
      'getUri',
      'request',
      'get',
      'delete',
      'head',
      'options',
      'post',
      'put',
      'patch',
    ];

    for (const method of proxyMethods) {
      const fn = jest.spyOn(httpService['instance'], method).mockImplementation(() => {
        return 'hello world'
      });
      httpService[method].call(httpService);
      expect(fn).toHaveBeenCalled();
      jest.restoreAllMocks();
    }
  });

  it('should test get method', async () => {
    const result = await httpService.get('https://api.github.com/users/octocat/orgs');
    expect(result.status).toEqual(200);
  });
});
