// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'cache',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class CacheConfiguration {}
