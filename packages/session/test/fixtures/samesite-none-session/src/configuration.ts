import { Configuration, Controller, Get } from '@midwayjs/decorator';
import * as koa from '../../../../../web-koa';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
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
