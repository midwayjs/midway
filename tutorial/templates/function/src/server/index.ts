import { CommonJSFileDetector } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import * as UnittestConfig from './config/config.unittest';

export default defineConfiguration({
  imports: [koa],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  detector: new CommonJSFileDetector(),
  async onReady(_container, app) {
    // StackBlitz preview.setUrl 会把 `?` 编成 %3F，这里还原成 query
    app.useMiddleware(async (ctx, next) => {
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
  },
});
