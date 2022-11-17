import { Configuration, Controller, Get, Inject, MidwayWebRouterService } from '../../../../src';

@Controller('/')
export class HomeController {
  @Get('/**')
  async home() {
    return 'main';
  }

  @Get('/test/**')
  async test() {
    return 'catch-all';
  }
}

@Configuration({
  imports: [],
})
export class ContainerLifeCycle {

  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    await this.webRouterService.getFlattenRouterTable();
    this.webRouterService.addRouter(
      ctx => {
        ctx.body = 'test';
      },
      {
        requestMethod: 'GET',
        url: '/asd',
        prefix: '/test',
      }
    );

    this.webRouterService.addRouter(
      ctx => {
        ctx.body = 'test';
      },
      {
        requestMethod: 'GET',
        url: '/test/asd',
        prefix: '/test',
      }
    );

    // (c)
    // (router as any).sortPrefixAndRouter();
  }
}
