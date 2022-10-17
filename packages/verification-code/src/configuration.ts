import { Configuration } from '@midwayjs/core';
import * as cacheComponent from '@midwayjs/cache';
import * as DefaultConfig from './config/config.default';
@Configuration({
  namespace: 'verification-code',
  imports: [cacheComponent],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class VerificationCodeConfiguration {}
