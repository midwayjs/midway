import { Configuration } from '@midwayjs/core';
import * as metrics from '../../../../src';


@Configuration({
  imports: [metrics],
  importConfigs: [
    {
      default: {
        koa: {
          keys: ['123']
        }
      }
    }
  ]
})
export class AutoConfiguration {
}
