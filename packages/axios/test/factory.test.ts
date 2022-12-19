import { join } from 'path';
import { HttpServiceFactory } from '../src';
import { createLightApp } from '@midwayjs/mock';
import * as nock from 'nock';

describe('/test/factory.test.ts', () => {

  beforeAll(async () => {
    nock('https://api.github.com')
      .persist()
      .get('/users/octocat/orgs')
      .reply(200, []);
  });

  afterAll(() => {
    nock.restore();
  });

  // 工厂单例
  it('should test with factory (add、override) single', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          default: {
            baseURL: 'https://www.xiaoqinvar.com',
            headers: {
              common: {
                Authorization: 'Bearer ...',
              },
            },
          },
        },
      },
    });
    const factory = await app
      .getApplicationContext()
      .getAsync(HttpServiceFactory);
    const defaultAxios = factory.get();
    const defaultConfig = defaultAxios.defaults;
    expect(defaultConfig.baseURL).toBe('https://www.xiaoqinvar.com');
    expect(defaultConfig.headers.common['Authorization']).toBe('Bearer ...');
  });

  // 工厂多例
  it('should test with factory with more configurations', async () => {
    const app = await createLightApp('', {
      imports: [require(join(__dirname, '../src'))],
      globalConfig: {
        axios: {
          default: {
            baseURL: 'https://www.abc.com',
            headers: {
              common: {
                Authorization: 'Bearer ...',
              },
            },
          },
          clients: {
            default: {
              baseURL: 'https://www.taobao.com',
              headers: {
                common: {
                  addHead: 'xiaoqinvar',
                },
              },
              timeout: 10000,
            },
            test: {
              timeout: 1000,
              baseURL: 'https://www.midwayjs.org',
              headers: {
                common: {
                  Authorization: 'Bearer test...',
                },
              },
            },
          },
        },
      },
    });
    const factory = await app
      .getApplicationContext()
      .getAsync(HttpServiceFactory);
    const defaultAxios = factory.get();
    const testAxios = factory.get('test');
    const defaultConfig = defaultAxios.defaults;
    const testConfig = testAxios.defaults;
    expect(defaultConfig.timeout).toBe(10000);
    expect(defaultConfig.baseURL).toBe('https://www.taobao.com');
    expect(defaultConfig.headers.common['Authorization']).toBe('Bearer ...');
    expect(defaultConfig.headers.common['addHead']).toBe('xiaoqinvar');
    expect(testConfig.timeout).toBe(1000);
    expect(testConfig.baseURL).toBe('https://www.midwayjs.org');
    expect(testConfig.headers.common['Authorization']).toBe('Bearer test...');
    expect(testConfig.headers.common['addHead']).toBeUndefined();
  });

  // 使用使用client字段报错
  it('should test with factory with use client field then throw error', async () => {
    try {
      await createLightApp('', {
        imports: [require(join(__dirname, '../src'))],
        globalConfig: {
          axios: {
            default: {
              baseURL: 'https://www.abc.com',
              headers: {
                common: {
                  Authorization: 'Bearer ...',
                },
              },
            },
            client: {
              default: {
                baseURL: 'https://www.taobao.com',
                headers: {
                  common: {
                    addHead: 'xiaoqinvar',
                  },
                },
                timeout: 10000,
              },
              test: {
                timeout: 1000,
                baseURL: 'https://www.midwayjs.org',
              },
            },
          },
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  // 测试兼容旧版本的axios midway的配置
  it('should test factory with old compatibility.', async () => {
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
    const factory = await app
      .getApplicationContext()
      .getAsync(HttpServiceFactory);
    const axiosConfig = factory.axiosConfig.clients.default;
    expect(axiosConfig['baseURL']).toBe('https://api.github.com/');
    expect(axiosConfig['client']['test']).toBe('test');
    const httpService = factory.get();
    expect(httpService).toBeDefined();
    const result = await httpService.get('users/octocat/orgs');
    expect(result.status).toBe(200);
  });
});
