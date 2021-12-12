import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as swagger from '../../../../src';

@Configuration({
  importConfigs: [{
    default: {
      keys: '12345',
      swagger: {
        auth: [{authType: 'basic', name: 'bbb'}, {authType: 'bearer', name: 'ttt'}]
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
