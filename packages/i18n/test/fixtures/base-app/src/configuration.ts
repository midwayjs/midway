import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        i18n: {
          languageTable: {
            en: {
              base: require('./i18n/en'),
            },
            'zh-cn': {
              base: require('./i18n/zh-cn'),
            },
          }
        }
      }
    }
  ]
})
export class AutoConfiguration {}
