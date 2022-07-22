import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config.default';

@Configuration({
  namespace: 'action',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ActionConfiguration {}
