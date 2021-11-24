import { MidwayI18nService } from '../src';
import { join } from 'path';
import { createLightApp, close } from '@midwayjs/mock';

describe('test/index.test.ts', () => {
  it('i18n service', async () => {
    const i18nService = new MidwayI18nService();
    i18nService.i18nConfig = {
      defaultLanguage: 'en',
      languageTable: {
        en: {
          base: {
            'hello': 'hello world'
          },
        },
        'zh-cn': {
          base: {
            'hello': '你好，世界'
          }
        }
      },
    }

    await i18nService.init();

    expect(i18nService.translate('base.hello')).toEqual('hello world');
    expect(i18nService.translate('base.hello', {
      lang: 'zh-cn'
    })).toEqual('你好，世界');
  });

  it('i18n service multi-level', async () => {
    const i18nService = new MidwayI18nService();
    i18nService.i18nConfig = {
      defaultLanguage: 'en',
      languageTable: {
        en: {
          "user": {
            "HELLO_MESSAGE": "Hello {username}",
            "USER_ADDED_PRODUCT": "{0} added {1} to cart",
          }
        }
      },
    }

    await i18nService.init();

    expect(i18nService.translate('user.HELLO_MESSAGE',{
      args: {
        username: 'world'
      }
    })).toEqual('Hello world');

    expect(i18nService.translate('user.USER_ADDED_PRODUCT',{
      args: ['a', 'b']
    })).toEqual('a added b to cart');
  });

  it('should test fallback', async () => {
    const i18nService = new MidwayI18nService();
    i18nService.i18nConfig = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      languageTable: {
        en: {
          "user": {
            "HELLO_MESSAGE": "Hello {username}",
            "USER_ADDED_PRODUCT": "{0} added {1} to cart",
          }
        },
        'zh-cn': {}
      },
    }

    await i18nService.init();

    expect(i18nService.translate('user.HELLO_MESSAGE',{
      lang: 'zh-cn',
      args: {
        username: 'world'
      }
    })).toEqual('Hello world');
  });

  it('should test create app', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'));
    const i18nService = await app.getApplicationContext().getAsync(MidwayI18nService);

    expect(i18nService.translate('base.HELLO_MESSAGE',{
      args: {
        username: 'world'
      }
    })).toEqual('Hello world');
    expect(i18nService.translate('base.HELLO_MESSAGE',{
      lang: 'zh-cn',
      args: {
        username: '世界'
      }
    })).toEqual('你好 世界');
    await close(app);
  });
});
