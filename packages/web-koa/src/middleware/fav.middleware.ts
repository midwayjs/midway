import { Config, Middleware } from '@midwayjs/core';

const path = require('path');
const MAX_AGE = 'public, max-age=2592000'; // 30 days

@Middleware()
export class SiteFileMiddleware {
  @Config('siteFile')
  siteFileConfig;

  resolve() {
    // use bodyparser middleware
    if (this.siteFileConfig.enable) {
      return async (ctx, next) => {
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return next();
        /* istanbul ignore if */
        if (ctx.path[0] !== '/') return next();

        if (ctx.path !== '/favicon.ico') {
          return next();
        }

        let content = this.siteFileConfig['favicon'];
        if (content === undefined) {
          content = Buffer.from('');
        }
        if (!content) return next();
        // content is url
        if (typeof content === 'string') return ctx.redirect(content);

        // '/robots.txt': Buffer <xx..
        // content is buffer
        if (Buffer.isBuffer(content)) {
          ctx.set('cache-control', MAX_AGE);
          ctx.body = content;
          ctx.type = path.extname(ctx.path);
          return;
        }

        return next();
      };
    }
  }

  static getName() {
    return 'siteFile';
  }
}
