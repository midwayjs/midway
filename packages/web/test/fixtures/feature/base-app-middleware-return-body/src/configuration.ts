import { Configuration, App, Inject, Get, Controller, } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get('/')
  async home() {
    return null;
  }

  @Get('/undefined')
  async rUndefined() {
    return undefined;
  }

  @Get('/null')
  async rNull() {
    return null;
  }
}

@Configuration({
  importConfigs: [
    {
      default: {
        keys: 'key',
      }
    }
  ],
  imports: [],
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady() {
    this.app.useMiddleware(async (ctx, next) => {
      const result = await next();
      if (!result) {
        return {
          code: 0,
          msg: 'ok',
          data: result,
        }
      }
    });
  }
}
