// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as a from './componentA/';
import * as b from './componentB/';
import * as DefaultConfig from './main/config/config.default';

@Configuration({
  namespace: 'book',
  imports: [a, b],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MainConfiguration {}
