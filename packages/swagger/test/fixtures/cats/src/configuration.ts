import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as swagger from '../../../../src';

@Configuration({
  importConfigs: [{
    default: {
      globalPrefix: '/helloworld/vvvv01',
      keys: '12345',
      swagger: {
        auth: [{authType: 'basic', name: 'bbb'}, {authType: 'bearer', name: 'ttt'}],
        tagSortable: true,
      },
    }
  }],
  imports: [
    koa,
    swagger
  ]
})
export class ContainerConfiguration {

}
