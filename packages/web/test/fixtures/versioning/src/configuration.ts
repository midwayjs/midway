import { Configuration, Inject } from '@midwayjs/core';
import * as web from '../../../../src';

@Configuration({
  imports: [
    web
  ],
  importConfigs: [
    {
      default: {
        keys: "test key",
        egg: {
          port: null,
          versioning: {
            enabled: true,
            type: 'URI',
            prefix: 'v'
          }
        }
      }
    }
  ]
})
export class AutoConfiguration {
  @Inject()
  framework: web.Framework;
}