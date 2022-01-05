import { Config, Middleware, MidwayFrameworkType, Match } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { JSONPService } from '../jsonp';
import { JSONPCSRFError } from '../error';
import { JSONPOptions } from '../interface';

@Match()
export class JSONPFilter {
  async match(value, req) {
    const jsonpService = await req.requestContext.getAsync(JSONPService);
    return jsonpService.jsonp(value);
  }
}

@Middleware()
export class JSONPMiddleware implements IMiddleware<any, any> {
  @Config('jsonp')
  jsonp: JSONPOptions;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      app.useFilter(JSONPFilter);
      return async (req: any, res: any, next: any) => {
        return this.compatibleMiddleware(req, next);
      };
    } else {
      return async (ctx,next) => {
        const result = await this.compatibleMiddleware(ctx, next);
        const jsonpService = await ctx.requestContext.getAsync(JSONPService);
        return jsonpService.jsonp(result);
      };
    }
  }

  async compatibleMiddleware(context, next) {
    const { csrf } = this.jsonp;
    // midway security
    if (csrf && context.assertCsrf) {
      try {
        context.assertCsrf();
      } catch (_) {
        throw new JSONPCSRFError();
      }
    }
    return await next();
  }
}
