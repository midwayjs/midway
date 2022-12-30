import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as swagger from '../../../../src';

@Configuration({
  imports: [
    koa,
    swagger
  ],
  importConfigs: {
    keys: 'abcde'
  }
})
export class ContainerConfiguration {

}
