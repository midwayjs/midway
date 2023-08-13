import { Configuration, App, Inject, MidwayWebRouterService } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @App()
  app: any;

  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    // koa/egg 格式
    this.webRouterService.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/api/user',
      requestMethod: 'GET',
    });
  }
}
