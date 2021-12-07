import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'passport',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class PassportConfiguration {}
