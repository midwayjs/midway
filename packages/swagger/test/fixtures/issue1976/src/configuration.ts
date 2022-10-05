import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as swagger from '../../../../src';
import * as validate from '@midwayjs/validate';

@Configuration({
  importConfigs: [{
    default: {
      keys: '12345',
      swagger: {},
    }
  }],
  imports: [
    koa,
    swagger,
    validate,
  ]
})
export class ContainerConfiguration {

}
