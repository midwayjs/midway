import {
  Config,
  MidwayFrameworkType,
  IMiddleware,
  Init,
  IgnoreMatcher,
} from '@midwayjs/core';
import { SecurityOptions } from '../interface';

export abstract class BaseMiddleware implements IMiddleware<any, any> {
  @Config('security')
  security: SecurityOptions;
  match: IgnoreMatcher<any>[];
  ignore: IgnoreMatcher<any>[];

  @Init()
  async init() {
    // 动态合并一些规则
    if (this.security?.[this.securityName()]?.match) {
      this.match = this.security[this.securityName()].match;
    } else if (this.security?.[this.securityName()]?.ignore) {
      this.ignore = this.security[this.securityName()].ignore;
    }
  }

  resolve(app) {
    if (this.security?.[this.securityName()]?.enable) {
      if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
        return async (req: any, res, next) => {
          return this.compatibleMiddleware(req, req, res, next);
        };
      } else {
        return async (ctx, next) => {
          return this.compatibleMiddleware(ctx, ctx.request, ctx, next);
        };
      }
    }
  }

  protected getSecurityPolicyConfig() {
    return this.security?.[this.securityName()] || {};
  }

  abstract compatibleMiddleware(context, req, res, next);
  abstract securityName(): string;
}
