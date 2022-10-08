import { Configuration, Provide, ILifeCycle, Get, MidwayWebRouterService, Inject, RouterInfo } from '../../../../src';
import { join } from 'path';

@Provide()
export class HomeController {
  @Get('/home')
  async home() {
    return 'hello world';
  }

  @Get('/home2')
  async home2() {
    return 'hello world2';
  }
}

@Configuration({
  importConfigs: [join(__dirname, './config/')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @Inject()
  routerService: MidwayWebRouterService;

  async onReady() {
    this.routerService.addController(
      HomeController,
      {
        prefix: '/api',
      },
      {
        resourceFilter: (routerInfo: RouterInfo) => {
          return routerInfo.method !== 'home2';
        },
      });
  }
}
