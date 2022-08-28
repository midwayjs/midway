import { join } from 'path';
import { HttpService } from '../src';
import { createLightApp } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  let httpService: any;
  let container;
  let app;

  beforeAll(async () => {
    app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
    });
    container = app.getApplicationContext();
    httpService = await container.getAsync(HttpService);
  });

  it('should test http service singleton', async () => {
    expect(httpService).toBeDefined();
    const httpService2 = await container.getAsync(HttpService);
    expect(httpService).toEqual(httpService2);
  });

  it('should test context http service', async () => {
    const ctx = app.createAnonymousContext();
    const httpServiceWithRequest = await ctx.requestContext.getAsync(
      HttpService
    );
    expect(httpServiceWithRequest).toBeDefined();
    expect(httpServiceWithRequest).toEqual(httpService);
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
      const fn = jest
        .spyOn(httpService['instance'], method)
        .mockImplementation(() => {
          return 'hello world';
        });
      httpService[method].call(httpService);
      expect(fn).toHaveBeenCalled();
      jest.restoreAllMocks();
    }
  });

  it('should test get method', async () => {
    const result = await httpService.get(
      'https://api.github.com/users/octocat/orgs'
    );
    expect(result.status).toEqual(200);
  });

  /**
   * 多配置下的HttpService测试
   */
  it('should test HttpService with single configuration', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          default: {
            baseURL: 'https://www.baidu.com',
          },
        },
      },
    });

    const httpService = await app.getApplicationContext().getAsync(HttpService);
    const searchResult = await httpService.get('/s?wd=test');
    expect(searchResult.status).toBe(200);
    expect(searchResult.data).toMatch('<!DOCTYPE html>');
  });

  /**
   * 多配置下的HttpService测试
   */
  it('should test HttpService with more configurations', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          default: {
            baseURL: 'https://www.baidu.com',
          },
          clients: {
            default: {
              timeout: 5000,
            },
            test: {
              timeout: 10000,
            },
          },
        },
      },
    });

    const httpService = await app.getApplicationContext().getAsync(HttpService);
    const result = await httpService.get(
      'https://api.github.com/users/octocat/orgs'
    );
    expect(result.status).toEqual(200);
  });

  // 使用httpService且配置文件为空axios配置
  it('should test HttpService with axios config is nullable object', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {},
      },
    });
    const httpService = await app.getApplicationContext().getAsync(HttpService);
    const result = await httpService.get(
      'https://api.github.com/users/octocat/orgs'
    );
    expect(result.status).toEqual(200);
  });
});
