import { Configuration } from '@midwayjs/core';
import * as cacheComponent from '@midwayjs/cache-manager';
import * as DefaultConfig from './config/config.default';
@Configuration({
  namespace: 'captcha',
  imports: [cacheComponent],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class CaptchaConfiguration {}
