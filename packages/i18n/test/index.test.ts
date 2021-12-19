import { MidwayI18nService } from '../src';
import { createLightApp, close, createHttpRequest, createApp } from '@midwayjs/mock';
import { join } from 'path';

describe('test/index.test.ts', () => {
  it('i18n service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'), {
      globalConfig: {
        i18n: {
          defaultLocale: 'en_US',
          localeTable: {
            en_US: {
              'hello': 'hello world'
            },
            'zh-CN': {
              'hello': '你好，世界'
            }
          },
        }
      }
    });

    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);

    expect(i18nService.translate('hello')).toEqual('hello world');
    expect(i18nService.translate('hello', {
      locale: 'zh-CN'
    })).toEqual('你好，世界');

    await close(app);
  });

  it('i18n service multi-level', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'), {
      globalConfig: {
        i18n: {
          defaultLocale: 'en_US',
          localeTable: {
            en_US: {
              "user": {
                "HELLO_MESSAGE": "Hello {username}",
                "USER_ADDED_PRODUCT": "{0} added {1} to cart",
              }
            }
          },
        }
      }
    });

    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);
    expect(i18nService.translate('HELLO_MESSAGE',{
      args: {
        username: 'world',
      },
      group: 'user'
    })).toEqual('Hello world');

    expect(i18nService.translate('USER_ADDED_PRODUCT',{
      group: 'user',
      args: ['a', 'b']
    })).toEqual('a added b to cart');

    await close(app);
  });

  it('should test fallbacks', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'), {
      globalConfig: {
        i18n: {
          defaultLocale: 'en_US',
          fallbackLanguage: 'en_US',
          localeTable: {
            en_US: {
              "HELLO_MESSAGE": "Hello {username}",
            },
            zh_CN: {
              "HELLO_MESSAGE": "你好 {username}",
            }
          },
          fallbacks: {
            'en_*': 'zh_CN'
          }
        }
      }
    });

    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);
    expect(i18nService.translate('HELLO_MESSAGE',{
      locale: 'en_US',
      args: {
        username: 'world'
      },
    })).toEqual('Hello world');

    expect(i18nService.translate('HELLO_MESSAGE',{
      locale: 'en_AU',
      args: {
        username: 'world'
      },
    })).toEqual('你好 world');

    expect(i18nService.translate('HELLO_MESSAGE',{
      locale: 'fr_FR',
      args: {
        username: 'world'
      },
    })).toEqual('Hello world');

    await close(app);
  });

  it('should test fallback to default lang', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'), {
      globalConfig: {
        i18n: {
          defaultLocale: 'en_US',
          fallbackLocale: 'en_US',
          localeTable: {
            en_US: {
              "user": {
                "HELLO_MESSAGE": "Hello {username}",
                "USER_ADDED_PRODUCT": "{0} added {1} to cart",
              }
            },
            zh_CN: {}
          },
        }
      }
    });
    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);
    expect(i18nService.translate('HELLO_MESSAGE',{
      locale: 'zh_CN',
      args: {
        username: 'world'
      },
      group: 'user'
    })).toEqual('Hello world');

    await close(app);
  });

  it('should test create app', async () => {
    const app = await createLightApp(join(
      __dirname,
      './fixtures/base-app-i18n'
    ));
    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);

    expect(i18nService.translate('HELLO_MESSAGE',{
      args: {
        username: 'world'
      },
      group: 'base'
    })).toEqual('Hello world');
    expect(i18nService.translate('HELLO_MESSAGE',{
      locale: 'zh_CN',
      args: {
        username: '世界'
      },
      group: 'base'
    })).toEqual('你好 世界');

    await close(app);
  });

  describe('i18n in koa', function () {
    it('should test with request by query', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-koa-query-locale'
      ));

      const result = await createHttpRequest(app).get('/').query({
        locale: 'zh_CN',
        username: '世界',
      });

      expect(result.text).toEqual('你好 世界');

      await close(app);
    });

    it('should test with request by header', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-koa-header-locale'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      await close(app);
    });

    it('should test with request by cookie', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-koa-cookie-locale'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      expect(result.headers['set-cookie'][0]).toMatch(/zh_CN/);

      const result1 = await createHttpRequest(app).get('/')
        .set({
          'cookie': result.headers['set-cookie'][0]
        })
        .query({
          username: '世界',
        });

      expect(result1.text).toEqual('你好 世界');
      expect(result1.headers['set-cookie'][0]).toMatch(/zh_CN/);
      await close(app);
    });

    it('should test with request by cookie and manual', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-koa-cookie-locale-manual'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      expect(result.headers['set-cookie'][0]).toMatch(/en_US/);
      await close(app);
    });
  });

  describe('i18n in express', function () {
    it('should test with request by query', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-express-query-locale'
      ));

      const result = await createHttpRequest(app).get('/').query({
        locale: 'zh_CN',
        username: '世界',
      });

      expect(result.text).toEqual('你好 世界');

      await close(app);
    });

    it('should test with request by header', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-express-header-locale'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      await close(app);
    });

    it('should test with request by cookie', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-express-cookie-locale'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      expect(result.headers['set-cookie'][0]).toMatch(/zh_CN/);

      const result1 = await createHttpRequest(app).get('/')
        .set({
          'cookie': result.headers['set-cookie'][0]
        })
        .query({
          username: '世界',
        });

      expect(result1.text).toEqual('你好 世界');
      expect(result1.headers['set-cookie'][0]).toMatch(/zh_CN/);
      await close(app);
    });

    it('should test with request by cookie and manual', async () => {
      const app = await createApp(join(
        __dirname,
        './fixtures/base-app-express-cookie-locale-manual'
      ));

      const result = await createHttpRequest(app).get('/')
        .set({
          locale: 'zh_CN',
        })
        .query({
          username: '世界',
        });

      expect(result.text).toEqual('你好 世界');
      expect(result.headers['set-cookie'][0]).toMatch(/en_US/);
      await close(app);
    });
  });
});
