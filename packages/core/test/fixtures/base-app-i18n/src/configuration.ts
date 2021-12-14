import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    {
      default: {
        i18n: {
          languageTable: {
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
