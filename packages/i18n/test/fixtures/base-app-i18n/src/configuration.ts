import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        i18n: {
          localeTable: {
            en_US: {
              base: require('./i18n/en'),
            },
            zh_CN: {
              base: require('./i18n/zh-cn'),
            },
          }
        }
      }
    }
  ]
})
export class AutoConfiguration {}
