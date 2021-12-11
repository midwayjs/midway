import { Configuration, Controller, Get } from '@midwayjs/decorator';
import * as koa from '../../../../../web-koa';

@Configuration({
  imports: [
    require('../../../../src'),
    koa
  ],
  importConfigs: [
    {
      default: {
        keys: '12345'
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
    // ctx.session.a = '1';
    return ctx.session;
  }
  @Get('/set')
  async set(ctx) {
    ctx.session = ctx.query;
    ctx.body = ctx.session;
  }
  @Get('/setKey')
  async setKey(ctx) {
    ctx.session.key = ctx.query.key;
    ctx.body = ctx.session;
  }
  @Get('/remove')
  async remove(ctx) {
    ctx.session = null;
    ctx.body = ctx.session;
  }
  @Get('/maxAge')
  async maxAge(ctx) {
    ctx.session.maxAge = Number(ctx.query.maxAge);
    ctx.body = ctx.session;
  }
}
