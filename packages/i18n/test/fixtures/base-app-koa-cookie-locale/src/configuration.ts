import { Configuration, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: '12345',
        i18n: {
          defaultLocale: 'en_US',
          localeTable: {
            en_US: {
              "HELLO_MESSAGE": "Hello {username}",
            },
            zh_CN: {
              "HELLO_MESSAGE": "你好 {username}",
            }
          },
        },
      }
    }
  ]
})
export class AutoConfiguration {
  @Inject()
  framework: koa.Framework;

  async onReady() {
  }
}
