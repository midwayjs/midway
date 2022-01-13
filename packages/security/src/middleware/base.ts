import { Config, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { SecurityOptions } from '../interface';

export abstract class BaseMiddleware implements IMiddleware<any, any> {
  @Config('security')
  security: SecurityOptions;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res, next) => {
        return this.compatibleMiddleware(req, res, next);
      };
    } else {
      return async (ctx, next) => {
        return this.compatibleMiddleware(ctx, ctx, next);
      };
    }
  }

  abstract compatibleMiddleware(req, res, next);
}
