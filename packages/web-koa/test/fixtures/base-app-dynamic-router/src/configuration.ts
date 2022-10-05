import { Configuration, App, Inject } from '@midwayjs/core';
import { MidwayWebRouterService } from '@midwayjs/core';
import { join } from 'path';
import { Framework } from '../../../../src';
import * as Validate from '../../../../../validate';
import { TestMiddleware } from './middleware/test';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    Validate
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  @Inject()
  webRouterService: MidwayWebRouterService

  async onReady() {

    this.webRouterService.addRouter(async (ctx, next) => {
      return 'hello world' + ctx.bbb;
    }, {
      url: '/api/user',
      requestMethod: 'GET',
      middleware: [TestMiddleware]
    });
  }
}
