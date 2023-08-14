import { Configuration, ILifeCycle } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'consul',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ConsulConfiguration implements ILifeCycle {}
