import { Configuration, Inject } from '@midwayjs/decorator';
import * as express from '@midwayjs/express';

@Configuration({
  imports: [
    express,
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
  framework: express.Framework;

  async onReady() {
  }
}
