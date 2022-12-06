// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'B',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BConfiguration {}
