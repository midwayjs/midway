import { IMiddleware, IMidwayApplication } from '@midwayjs/core';
import {
  Config,
  Match,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { I18N_ATTR_KEY, I18N_SAVE_KEY, I18nOptions } from './interface';

@Match()
export class I18nFilter {
  @Config('i18n.resolver')
  resolverConfig: I18nOptions['resolver'];

  match(value, req, res) {
    const saveLocale = req.getAttr(I18N_SAVE_KEY);
    if (saveLocale) {
      const cookieOptions = {
        // make sure browser javascript can read the cookie
        httpOnly: false,
        maxAge: this.resolverConfig.cookieMaxAge,
        signed: false,
        domain: this.resolverConfig.cookieDomain,
      };
      res.cookie(this.resolverConfig.cookieField, saveLocale, cookieOptions);
    }
  }
}

@Middleware()
export class I18nMiddleware implements IMiddleware<any, any> {
  @Config('i18n.resolver')
  resolverConfig: I18nOptions['resolver'];

  resolve(app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      // add a filter for i18n cookie
      app.useFilter(I18nFilter);
      return (req, res, next) => {
        req.setAttr(
          I18N_ATTR_KEY,
          req.query[this.resolverConfig.queryField] ??
            req.get(this.resolverConfig.headerField) ??
            req.cookies[this.resolverConfig.cookieField]
        );
        return next();
      };
    } else {
      return async (ctx, next) => {
        ctx.setAttr(
          I18N_ATTR_KEY,
          ctx.query[this.resolverConfig.queryField] ??
            ctx.get(this.resolverConfig.headerField) ??
            ctx.cookies.get(this.resolverConfig.cookieField)
        );
        await next();
        const saveLocale = ctx.getAttr(I18N_SAVE_KEY);
        if (saveLocale) {
          const cookieOptions = {
            // make sure browser javascript can read the cookie
            httpOnly: false,
            maxAge: this.resolverConfig.cookieMaxAge,
            signed: false,
            domain: this.resolverConfig.cookieDomain,
            overwrite: true,
          };
          ctx.cookies.set(
            this.resolverConfig.cookieField,
            saveLocale,
            cookieOptions
          );
        }
      };
    }
  }
}
