import { join } from 'path';
import { HttpService } from '../src';
import { createLightApp } from '@midwayjs/mock';
import * as nock from 'nock';

describe('/test/index.test.ts', () => {
  let httpService: any;
  let container;
  let app;

  beforeAll(async () => {
    nock('https://api.github.com')
      .persist()
      .get('/users/octocat/orgs')
      .reply(200, []);
    app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
    });
    container = app.getApplicationContext();
    httpService = await container.getAsync(HttpService);
  });

  afterAll(() => {
    nock.restore();
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
   * 单配置，default下的HttpService测试
   */
  it('should test HttpService with single configuration', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          default: {
            baseURL: 'https://api.github.com/',
          },
        },
      },
    });

    const httpService = await app.getApplicationContext().getAsync(HttpService);
    const searchResult = await httpService.get('/users/octocat/orgs');
    expect(searchResult.status).toBe(200);
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
            baseURL: 'https://api.github.com/',
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
      globalConfig: {},
    });
    const httpService = await app.getApplicationContext().getAsync(HttpService);
    const result = await httpService.get(
      'https://api.github.com/users/octocat/orgs'
    );
    expect(result.status).toEqual(200);
  });

  // 测试兼容旧版本的axios midway的配置
  it('should test HttpService with client field、 clients field and axios older configuration.', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          baseURL: 'https://api.github.com/',
          client: {
            test: 'test',
          },
        },
      },
    });
    const httpService = await app.getApplicationContext().getAsync(HttpService);
    expect(httpService).toBeDefined();
    const result = await httpService.get('users/octocat/orgs');
    expect(result.status).toBe(200);
  });
});
