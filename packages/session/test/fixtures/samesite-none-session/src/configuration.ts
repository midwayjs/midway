import { Configuration, Controller, Get } from '@midwayjs/core';
import * as koa from '../../../../../web-koa';

@Configuration({
  imports: [
    koa,
  ],
  importConfigs: [
    {
      default: {
        keys: '12345',
        session: {
          sameSite: 'none',
        }
      }
    }
  ]
})
export class AutoConfiguration {
}

@Controller('/')
export class HomeController {

  @Get('/get')
  async get(ctx) {
    return ctx.session;
  }
  @Get('/set')
  async set(ctx) {
    ctx.session = ctx.query;
    ctx.body = ctx.session;
  }
}
