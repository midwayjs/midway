import { Configuration, Controller, Get } from '@midwayjs/core';
import * as koa from '../../../../../web-koa';
import * as assert from 'assert';

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
  async onReady(container, app) {
    const message = 'hi';
    app.useMiddleware(async (ctx, next) => {
      ctx.session = { message: 'hi' };
      await next();
    });

    app.useMiddleware(async function(ctx, next) {
      const sessionKey = ctx.cookies.get('MW_SESS', { signed: false });
      if (sessionKey) {
        await ctx.session.regenerate();
      }
      await next();
    });

    app.useMiddleware(async function(ctx) {
      assert.ok(ctx.session.message === message);
      ctx.body = '';
    });
  }
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
