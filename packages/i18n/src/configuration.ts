import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config.default';

@Configuration({
  namespace: 'info',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class I18nConfiguration {}
