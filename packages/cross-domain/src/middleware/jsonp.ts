import { Config, Middleware, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { JSONPService } from '../jsonp';
import { JSONPCSRFError } from '../error';
import { JSONPOptions } from '../interface';
@Middleware()
export class JSONPMiddleware implements IMiddleware<any, any> {
  @Config('jsonp')
  jsonp: JSONPOptions;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return this.compatibleMiddleware(req, next);
      };
    } else {
      return async (ctx, next) => {
        return this.compatibleMiddleware(ctx, next);
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

    const result = await next();
    const jsonpService = await context.requestContext.getAsync(JSONPService);
    return jsonpService.jsonp(result);
  }
}
