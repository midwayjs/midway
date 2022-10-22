// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'A',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class AConfiguration {}
