import { Configuration, } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
@Configuration({
  namespace: 'cross-domain',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class CrossDomainConfiguration {}
