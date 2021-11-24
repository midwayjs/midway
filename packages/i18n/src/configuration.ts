import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config.default';

@Configuration({
  namespace: 'i18n',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class I18nConfiguration {}
