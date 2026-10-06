import { Configuration, App, CommonJSFileDetector } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as UnittestConfig from './config/config.unittest';

@Configuration({
  imports: [koa],
  detector: new CommonJSFileDetector(),
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // StackBlitz preview.setUrl 会把 `?` 编成 %3F，这里还原成 query
    this.app.useMiddleware(async (ctx, next) => {
      const raw = String(ctx.req.url || '');
      if (/%3F/i.test(raw) && !raw.includes('?')) {
        try {
          ctx.url = decodeURIComponent(raw);
        } catch {
          // ignore malformed percent-encoding
        }
      }
      await next();
    });
  }
}
